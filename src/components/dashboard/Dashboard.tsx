import { useEffect, useState } from 'react'
import { LogOut, Sparkles, FileText, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import NoteList from '@/components/notes/NoteList'
import NoteEditor from '@/components/notes/NoteEditor'
import NewNoteButton from '@/components/notes/NewNoteButton'

interface DashboardProps {
  onLogout: () => void
}
type Note = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [loading, setLoading] = useState(true)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [notes, setNotes] = useState<Note[]>([])


  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (!data?.user || error) {
          onLogout()
        } else {
          setUserEmail(data.user.email ?? null)
        }
      } catch (error) {
        console.error('Error getting user:', error)
        onLogout()
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [onLogout])
  const fetchNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('notes')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setNotes(data)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])
  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Saha AI
              </h1>
              <p className="text-xs text-gray-500">Intelligent note-taking</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/50 px-3 py-2 rounded-full">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
                {userEmail}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white/70 backdrop-blur-md border-r border-gray-200/50 p-6 shadow-sm overflow-y-auto">
          <div className="space-y-6">
            <NewNoteButton onCreate={setSelectedNoteId} />
            <NoteList
              selectedNoteId={selectedNoteId}
              onSelect={setSelectedNoteId}
              notes={notes}
              setNotes={setNotes}
            />
          </div>
        </aside>

        {/* Editor Panel */}
        <main className="flex-1 overflow-y-auto p-8">
          {selectedNoteId ? (
            <NoteEditor
            noteId={selectedNoteId}
            onNotesUpdate={fetchNotes}
          />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-6 max-w-md">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to write?</h2>
                  <p className="text-gray-500 leading-relaxed">
                    Select a note from the sidebar to start editing, or create a new one to begin your journey.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  AI-powered insights available
                </Badge>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}