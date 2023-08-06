"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userValidation } from "@/lib/validations/user"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface Props {
  user: {
    id: string
    objectId: string
    username: string
    name: string
    bio: string
    image: string
  }
  btnTitle: string
}

const AccoutProfile: React.FC<Props> = ({ user, btnTitle }) => {
  const form = useForm({
    resolver: zodResolver(userValidation),
    defaultValues: {
      username: "",
      name: "",
      bio: "",
      profile_photo: "",
    },
  })
  const onSubmit = (defaultValues: any) => {
    console.log(defaultValues)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder='shadcn' {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>Submit</Button>
      </form>
    </Form>
  )
}

export default AccoutProfile
