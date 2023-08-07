"use server"
import { revalidatePath } from "next/cache"
import Thread from "../models/thread.model"
import User from "../models/user.model"
import { connectToDB } from "../mongoose"

interface Props {
  text: string
  author: string
  communityId: string | null
  path: string
}

export async function createThread({ text, author, communityId, path }: Props) {
  try {
    connectToDB()
    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    })
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    })
    revalidatePath(path)
    return createThread
  } catch (error: any) {
    throw new Error(`Failed to create thread ${error.message}`)
  }
}

export async function fetchPosts(
  pageNumber: number = 1,
  pageSize: number = 20
) {
  try {
    connectToDB()

    const skipAmount = (pageNumber - 1) * pageSize

    const postsQuery = Thread.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      })

    const totalPostsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    })

    const posts = await postsQuery.exec()

    const isNextPage = totalPostsCount > pageNumber * pageSize

    return { posts, isNextPage }
  } catch (error: any) {
    throw new Error(`Failed to fetch threads ${error.message}`)
  }
}

export async function fetchThreadById(id: string) {
  try {
    connectToDB()
    // TODO: populate community
    const thread = await Thread.findById(id)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id id name parentId image",
        },
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
        ],
      })
      .exec()
    return thread
  } catch (error: any) {
    throw new Error(`Failed to fetch thread ${error.message}`)
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  try {
    connectToDB()
    const originalThread = await Thread.findById(threadId)
    if (!originalThread) throw new Error("Thread not found")
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    })

    const savedCommentThread = await commentThread.save()

    originalThread.children.push(savedCommentThread._id)
    await originalThread.save()
    revalidatePath(path)
  } catch (error: any) {
    throw new Error(`Failed to add comment to thread ${error.message}`)
  }
}
