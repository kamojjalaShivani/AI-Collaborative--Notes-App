import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from './use-toast'

export interface Note {
  id: string
  title: string
  content: string
  summary: string
  created_at: string
  updated_at: string
  user_id: string
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        throw error
      }

      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast({
        title: "Failed to load notes",
        description: "Please try refreshing the page",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createNote = async (title: string = 'Untitled Note') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title,
          content: '',
          summary: ''
        })
        .select()
        .single()

      if (error) throw error

      setNotes(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('Error creating note:', error)
      toast({
        title: "Failed to create note",
        description: "Please try again",
        variant: "destructive"
      })
      return null
    }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, ...updates } : note
      ))
    } catch (error) {
      console.error('Error updating note:', error)
      toast({
        title: "Failed to update note",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error

      setNotes(prev => prev.filter(note => note.id !== id))
      toast({
        title: "Note deleted",
        description: "The note has been permanently deleted"
      })
    } catch (error) {
      console.error('Error deleting note:', error)
      toast({
        title: "Failed to delete note",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes
  }
}