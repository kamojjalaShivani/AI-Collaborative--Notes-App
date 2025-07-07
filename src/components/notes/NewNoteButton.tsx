import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface NewNoteButtonProps {
  onCreate: (noteId: string) => void
}

export default function NewNoteButton({ onCreate }: NewNoteButtonProps) {
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const handleCreateNote = async () => {
    setIsCreating(true)
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (!user || userError) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create notes",
          variant: "destructive"
        })
        return
      }

      const { data, error: insertError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: 'Untitled Note',
          content: '',
          summary: ''
        })
        .select()
        .single()

      if (insertError) {
        toast({
          title: "Failed to create note",
          description: insertError.message,
          variant: "destructive"
        })
      } else {
        onCreate(data.id)
        toast({
          title: "Note created",
          description: "Your new note is ready to edit"
        })
      }
    } catch (error) {
      toast({
        title: "Unexpected error",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Button
      onClick={handleCreateNote}
      disabled={isCreating}
      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group"
    >
      <div className="flex items-center justify-center gap-2">
        {isCreating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
        )}
        {isCreating ? 'Creating...' : 'New Note'}
      </div>
    </Button>
  )
}