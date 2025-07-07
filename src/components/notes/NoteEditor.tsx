import { useEffect, useState } from 'react'
import { Save, Sparkles, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { summarizeNote } from '../../api/summarise'


interface NoteEditorProps {
  noteId: string
  onNotesUpdate?:()=>void
}

export default function NoteEditor({ noteId,onNotesUpdate }: NoteEditorProps) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true)
      setTitle('')
      setContent('')
      setSummary('')

      try {
        const { data, error } = await supabase
          .from('notes')
          .select('title, content, summary')
          .eq('id', noteId)
          .single()

        if (data && !error) {
          setContent(data.content || '')
          setTitle(data.title || '')
          setSummary(data.summary || '')
        }
      } catch (error) {
        console.error('Error fetching note:', error)
      } finally {
        setLoading(false)
      }
    }

    if (noteId) {
      fetchNote()
    }
  }, [noteId])

  const handleSave = async () => {
    if (!noteId) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', noteId)

      if (!error) {
        toast({
          title: "Note saved",
          description: "Your changes have been saved successfully"
        })
        if (onNotesUpdate) {
          onNotesUpdate();
        }
      } else {
        throw error
      }
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // const handleSummarize = async () => {
  //   if (!content.trim()) return

  //   setGenerating(true)
  //   try {
  //     // This would typically call your AI summarization API
  //     // For now, we'll create a simple mock summary
  //     const mockSummary = `Summary of "${title}": This note contains ${content.split(' ').length} words and discusses various topics related to the content provided.`
      
  //     setSummary(mockSummary)
  //     await supabase
  //       .from('notes')
  //       .update({ summary: mockSummary })
  //       .eq('id', noteId)

  //     toast({
  //       title: "Summary generated",
  //       description: "AI summary has been created for your note"
  //     })
  //   } catch (error) {
  //     toast({
  //       title: "Failed to summarize",
  //       description: "Please try again",
  //       variant: "destructive"
  //     })
  //   } finally {
  //     setGenerating(false)
  //   }
  // }
  const handleSummarize = async () => {
    if (!content.trim()) return
  
    setGenerating(true)
    try {
      const summary = await summarizeNote(content)
      setSummary(summary)
  
      await supabase
        .from('notes')
        .update({ summary })
        .eq('id', noteId)
    } catch (error) {
      alert('Failed to summarize. Try again.')
      console.error(error)
    }
    setGenerating(false)
  }
  

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)

    try {
      await supabase
        .from('notes')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', noteId)
    } catch (error) {
      console.error('Failed to update title:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading note...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Input
                value={title}
                onChange={handleTitleChange}
                placeholder="Untitled Note"
                className="text-2xl font-bold border-none bg-transparent p-0 h-auto focus-visible:ring-0 placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={handleSummarize}
                disabled={generating || !content.trim()}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-sm"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {generating ? 'Generating...' : 'AI Summary'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your thoughts..."
            className="min-h-[500px] border-none resize-none text-lg leading-relaxed p-8 focus-visible:ring-0 bg-transparent"
          />
        </CardContent>
      </Card>

      {summary && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-purple-700">AI Summary</h3>
                <Badge variant="secondary" className="text-xs">
                  Generated
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {summary}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}