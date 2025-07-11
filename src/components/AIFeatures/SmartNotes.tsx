import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { geminiService } from '../../services/geminiService';
import { FileText, Plus, Edit3, Save, Trash2, Sparkles, Brain, BookOpen, Target, Lightbulb } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  aiSummary?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface SmartNotesProps {
  chapter: any;
  subject: string;
}

const SmartNotes: React.FC<SmartNotesProps> = ({ chapter, subject }) => {
  const { theme } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem(`notes_${chapter.id}`);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, [chapter.id]);

  const saveNotesToStorage = (updatedNotes: Note[]) => {
    localStorage.setItem(`notes_${chapter.id}`, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const generateAISummary = async (content: string): Promise<string> => {
    try {
      const prompt = `Create a concise, intelligent summary of these study notes for ${chapter.title} in ${subject}:

"${content}"

Provide:
1. Key points (2-3 bullet points)
2. Main concepts
3. Important takeaways

Keep it concise but comprehensive. Format as a clear summary.`;

      const response = await geminiService.makeRequest(prompt);
      return response;
    } catch (error) {
      return 'AI summary unavailable';
    }
  };

  const generateAITags = (content: string): string[] => {
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    
    const keywords = words
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .reduce((acc: { [key: string]: number }, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    setIsGeneratingAI(true);
    const aiSummary = await generateAISummary(newNote.content);
    const tags = generateAITags(newNote.content);

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      aiSummary,
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedNotes = [...notes, note];
    saveNotesToStorage(updatedNotes);
    setNewNote({ title: '', content: '' });
    setIsCreating(false);
    setIsGeneratingAI(false);
  };

  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    setIsGeneratingAI(true);
    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        const updated = { ...note, ...updates, updatedAt: new Date() };
        if (updates.content) {
          // Regenerate AI summary and tags if content changed
          generateAISummary(updates.content).then(aiSummary => {
            const tags = generateAITags(updates.content);
            const finalUpdated = { ...updated, aiSummary, tags };
            const finalNotes = notes.map(n => n.id === noteId ? finalUpdated : n);
            saveNotesToStorage(finalNotes);
          });
        }
        return updated;
      }
      return note;
    });
    saveNotesToStorage(updatedNotes);
    setEditingNote(null);
    setIsGeneratingAI(false);
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    saveNotesToStorage(updatedNotes);
  };

  const generateAINote = async () => {
    setIsGeneratingAI(true);
    try {
      const prompt = `Generate comprehensive study notes for "${chapter.title}" in ${subject}.

Create notes that include:
1. Key concepts and definitions
2. Important points to remember
3. Practical applications
4. Common pitfalls or mistakes
5. Study tips

Format as clear, organized notes that a student would find helpful for review.`;

      const content = await geminiService.makeRequest(prompt);
      const aiSummary = await generateAISummary(content);
      const tags = generateAITags(content);

      const note: Note = {
        id: Date.now().toString(),
        title: `AI-Generated Notes: ${chapter.title}`,
        content,
        aiSummary,
        tags,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedNotes = [...notes, note];
      saveNotesToStorage(updatedNotes);
    } catch (error) {
      console.error('Failed to generate AI notes:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
      theme === 'dark' 
        ? 'bg-slate-800/50 border-white/10' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-8">
        <h3 className={`text-2xl font-bold flex items-center transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <FileText className="w-7 h-7 mr-3 text-blue-500" />
          Smart Notes
        </h3>
        <div className="flex space-x-3">
          <button
            onClick={generateAINote}
            disabled={isGeneratingAI}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
          >
            <Brain className="w-4 h-4" />
            <span>AI Notes</span>
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Create New Note */}
      {isCreating && (
        <div className={`border rounded-2xl p-6 mb-6 transition-colors ${
          theme === 'dark' ? 'border-white/10 bg-slate-700/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <input
            type="text"
            placeholder="Note title..."
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className={`w-full p-3 rounded-xl border mb-4 transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-600 border-white/10 text-white placeholder-gray-400' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />
          <textarea
            placeholder="Write your notes here..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            rows={6}
            className={`w-full p-3 rounded-xl border mb-4 transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-600 border-white/10 text-white placeholder-gray-400' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsCreating(false)}
              className={`px-4 py-2 rounded-xl transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-white hover:bg-slate-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateNote}
              disabled={!newNote.title.trim() || !newNote.content.trim() || isGeneratingAI}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
            >
              {isGeneratingAI ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-6">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className={`w-16 h-16 mx-auto mb-4 transition-colors ${
              theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <p className={`text-lg transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              No notes yet. Create your first note or generate AI notes to get started!
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={`border rounded-2xl p-6 transition-colors ${
              theme === 'dark' ? 'border-white/10 bg-slate-700/30' : 'border-gray-200 bg-gray-50'
            }`}>
              {editingNote === note.id ? (
                <div>
                  <input
                    type="text"
                    value={note.title}
                    onChange={(e) => handleUpdateNote(note.id, { title: e.target.value })}
                    className={`w-full p-3 rounded-xl border mb-4 transition-colors ${
                      theme === 'dark' 
                        ? 'bg-slate-600 border-white/10 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                  <textarea
                    value={note.content}
                    onChange={(e) => handleUpdateNote(note.id, { content: e.target.value })}
                    rows={6}
                    className={`w-full p-3 rounded-xl border mb-4 transition-colors ${
                      theme === 'dark' 
                        ? 'bg-slate-600 border-white/10 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setEditingNote(null)}
                      className={`px-4 py-2 rounded-xl transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-white hover:bg-slate-600' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h4 className={`text-xl font-bold transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{note.title}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingNote(note.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                        }`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className={`prose max-w-none mb-4 transition-colors ${
                    theme === 'dark' ? 'prose-invert' : ''
                  }`}>
                    <p className="whitespace-pre-wrap">{note.content}</p>
                  </div>

                  {note.aiSummary && (
                    <div className={`p-4 rounded-xl border-l-4 border-purple-500 mb-4 transition-colors ${
                      theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-purple-500 font-medium text-sm">AI Summary</span>
                      </div>
                      <p className={`text-sm transition-colors ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>{note.aiSummary}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                            theme === 'dark' 
                              ? 'bg-slate-600 text-gray-300' 
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className={`text-xs transition-colors ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {note.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SmartNotes;