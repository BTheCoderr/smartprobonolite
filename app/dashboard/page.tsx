'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/lib/hooks/useProfile';
import { supabase } from '@/lib/supabaseClient';
import type { Chat, Document } from '@/lib/supabaseClient';
import ChatBox from './components/ChatBox';
import FileUploader from './components/FileUploader';
import OutputViewer from './components/OutputViewer';

export default function DashboardPage() {
  const { user, profile } = useProfile();
  const [chats, setChats] = useState<Chat[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'documents'>('chat');
  const [uploadedText, setUploadedText] = useState<string>('');
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!supabase || !user) return;

    try {
      // Fetch chats
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (chatsError) {
        console.error('Error fetching chats:', chatsError);
      } else {
        setChats(chatsData || []);
        if (chatsData && chatsData.length > 0) {
          setSelectedChat(chatsData[0]);
        }
      }

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
      } else {
        setDocuments(documentsData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    if (!supabase || !user) return;

    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          user_id: user.id,
          title: 'New Conversation',
          messages: [],
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat:', error);
      } else {
        setChats(prev => [data, ...prev]);
        setSelectedChat(data);
        setActiveTab('chat');
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleFileUploaded = (text: string, fileName: string) => {
    setUploadedText(text);
    setCurrentFileName(fileName);
  };

  const handleOutputGenerated = (output: string) => {
    setGeneratedOutput(output);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Welcome Header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">👋</span>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, <span className="text-primary-600">{profile?.full_name || 'Attorney'}</span>
          </h1>
        </div>
        <p className="text-gray-600">
          {profile?.firm_name ? `${profile.firm_name} • ` : ''}Ready to work with Ermi?
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💬 New Chat
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📚 Chat History ({chats.length})
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📄 Documents ({documents.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-400px)] min-h-[600px]">
          {/* Left Pane - Chat with Ermi */}
          <div className="flex flex-col gap-4 h-full">
            <FileUploader onFileUploaded={handleFileUploaded} />
            
            {uploadedText && (
              <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Uploaded: {currentFileName}
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 max-h-24 overflow-y-auto custom-scrollbar border border-gray-200">
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">
                    {uploadedText.substring(0, 300)}
                    {uploadedText.length > 300 && '...'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex-1 min-h-0">
              <ChatBox
                uploadedText={uploadedText}
                onOutputGenerated={handleOutputGenerated}
              />
            </div>
          </div>

          {/* Right Pane - Document Preview */}
          <div className="h-full">
            <OutputViewer output={generatedOutput} />
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Your Chat History</h2>
            <button
              onClick={createNewChat}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              + New Chat
            </button>
          </div>
          
          {chats.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-4">Start your first conversation with Ermi to see it here.</p>
              <button
                onClick={createNewChat}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Start New Chat
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{chat.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {chat.messages?.length || 0} messages
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(chat.updated_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(chat.updated_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Generated Documents</h2>
          
          {documents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-600 mb-4">Generate your first document with Ermi to see it here.</p>
              <button
                onClick={() => setActiveTab('chat')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Start Chatting
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{doc.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {doc.document_type} • {doc.content.length} characters
                      </p>
                      <div className="mt-2 bg-gray-50 rounded p-2 max-h-20 overflow-y-auto">
                        <p className="text-xs text-gray-600">
                          {doc.content.substring(0, 200)}
                          {doc.content.length > 200 && '...'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                          View
                        </button>
                        <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 border-t border-gray-200 pt-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center text-xs text-gray-500">
          <span>SmartProBono © {new Date().getFullYear()}</span>
          <span className="hidden sm:inline">•</span>
          <span>
            Powered by <span className="text-primary-600 font-semibold">Ermi AI</span>
          </span>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">
          Ermi does not provide legal advice — all outputs require attorney review.
        </p>
      </footer>
    </div>
  );
}