import { useState, useEffect } from 'react'
import { FileText, ChevronRight, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type Note = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface NoteListProps {
  notes:Note[]
  selectedNoteId: string | null
  onSelect: (id: string) => void
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>
}

export default function NoteList({ selectedNoteId, onSelect ,notes,setNotes}: NoteListProps) {
  //const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        console.log(user)
        if (!user) return

        const { data, error } = await supabase
          .from('notes')
          .select('id, title, created_at, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (data && !error) {
          setNotes(data)
        }
      } catch (error) {
        console.error('Error fetching notes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '—'
  
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '—'
  
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }
  

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm text-gray-600 uppercase tracking-wider">
          Your Notes
        </h2>
        <Badge variant="secondary" className="text-xs">
          {notes.length}
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 bg-white/50 border-gray-200/50 focus:bg-white focus:border-gray-300"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-white/50">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          {searchQuery ? (
            <>
              <p className="text-sm font-medium">No notes found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">No notes yet</p>
              <p className="text-xs text-gray-400 mt-1">Create your first note above</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelect(note.id)}
              className={`group cursor-pointer p-4 rounded-xl text-sm transition-all duration-200 border ${
                note.id === selectedNoteId
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-300 shadow-lg scale-[1.02]'
                  : 'bg-white/50 text-gray-700 border-gray-200/50 hover:bg-white hover:border-gray-300 hover:shadow-md hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate mb-1 ${
                    note.id === selectedNoteId ? 'text-white' : 'text-gray-900'
                  }`}>
                    {note.title || 'Untitled Note'}
                  </h3>
                  <p className={`text-xs ${
                    note.id === selectedNoteId ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatDate(note.updated_at)}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                  note.id === selectedNoteId 
                    ? 'text-white transform translate-x-1' 
                    : 'text-gray-400 group-hover:text-gray-600 group-hover:transform group-hover:translate-x-1'
                }`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}