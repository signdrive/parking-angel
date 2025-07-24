import BlogEditor from '../../new/page'

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default function EditPostPage({ params }: EditPostPageProps) {
  return <BlogEditor postId={params.id} />
}
