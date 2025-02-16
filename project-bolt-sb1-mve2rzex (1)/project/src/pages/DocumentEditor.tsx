import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Save, Share2, Download, MessageSquare, Wand2, Sparkles, Clock } from 'lucide-react';
import { saveAs } from 'file-saver';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface Version {
  id: string;
  title: string;
  content: { text: string };
  created_at: string;
  created_by: string;
}

const templates = {
  contract: "This contract is made between [Party A] and [Party B].",
  agreement: "This agreement sets forth the terms between [Party A] and [Party B].",
  resume: "Name: [Your Name]\nSkills: [Your Skills]\nExperience: [Your Experience]",
  empty: ""
};

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('Untitled Document');
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templates>("empty");
  const [content, setContent] = useState('');
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isImproving, setIsImproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [aiMessage, setAiMessage] = useState('How can I help you with your document?');
  const [userMessage, setUserMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (id) {
      loadDocument();
    }
  }, [id, user]);

  useEffect(() => {
    if (id) {
      loadVersions();
    }
  }, [id, user]);

  const loadDocument = async () => {
    if (!user) {
      setSaveStatus('Please sign in to load documents');
      return;
    }

    if (!id) {
      setSaveStatus('No document ID provided');
      return;
    }

    setIsLoading(true);
    setSaveStatus('Loading document...');

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title);
        setContent(data.content.text || '');
        setSaveStatus('Document loaded successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Document not found');
        navigate('/editor', { replace: true });
      }
    } catch (error: any) {
      console.error('Error loading document:', error);
      setSaveStatus(`Error: ${error.message || 'Failed to load document'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVersions = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select(`
          id,
          title,
          content,
          created_at,
          created_by
        `)
        .eq('document_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const saveDocument = async () => {
    if (!user) {
      setSaveStatus('Please sign in to save documents');
      return;
    }

    setIsSaving(true);
    setSaveStatus('Saving...');

    try {
      const documentData = {
        title,
        content: { text: content },
        user_id: user.id,
        status: 'draft'
      };

      let response;

      if (id) {
        response = await supabase
          .from('documents')
          .update(documentData)
          .eq('id', id)
          .eq('user_id', user.id);
      } else {
        response = await supabase
          .from('documents')
          .insert([documentData])
          .select();
      }

      if (response.error) throw response.error;

      setSaveStatus('Document saved successfully!');
      
      if (!id && response.data?.[0]?.id) {
        navigate(`/editor/${response.data[0].id}`, { replace: true });
      }
    } catch (error: any) {
      console.error('Error saving document:', error);
      setSaveStatus(`Error: ${error.message || 'Failed to save document'}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        if (saveStatus === 'Document saved successfully!') {
          setSaveStatus('');
        }
      }, 3000);
    }
  };

  const saveVersion = async () => {
    if (!id || !user || isReadOnly) return;

    try {
      const { error } = await supabase
        .from('document_versions')
        .insert({
          document_id: id,
          content: { text: content },
          title,
          created_by: user.id
        });

      if (error) throw error;
      loadVersions();
      setSaveStatus('Version saved successfully!');
    } catch (error: any) {
      console.error('Error saving version:', error);
      setSaveStatus(`Error: ${error.message || 'Failed to save version'}`);
    }
  };

  const restoreVersion = async (version: Version) => {
    if (!id || !user || isReadOnly) return;

    try {
      setContent(version.content.text);
      setTitle(version.title);
      setSaveStatus('Version restored! Remember to save the document.');
      setShowVersions(false);
    } catch (error: any) {
      console.error('Error restoring version:', error);
      setSaveStatus(`Error: ${error.message || 'Failed to restore version'}`);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = e.target.value as keyof typeof templates;
    setSelectedTemplate(template);
    if (template !== 'empty') {
      setContent(templates[template]);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${title.toLowerCase().replace(/\s+/g, '-')}.txt`);
  };

  const handleAISuggestion = async () => {
    if (!content.trim()) {
      setAiMessage("Please add some content to your document first.");
      setShowAiAssistant(true);
      return;
    }

    setIsImproving(true);
    setAiMessage("Processing your request...");
    setShowAiAssistant(true);

    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      if (!data || typeof data.suggestion !== 'string') {
        throw new Error('Invalid response format from AI service');
      }

      setContent(data.suggestion);
      setAiMessage("Document improved! Here's the enhanced version.");
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setAiMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "The AI service is currently unavailable. Please try again in a few minutes."
      );
    } finally {
      setIsImproving(false);
    }
  };

  const handleAssistantMessage = async () => {
    if (!userMessage.trim()) {
      setAiMessage("Please enter a question or request.");
      return;
    }

    setIsImproving(true);
    setAiMessage("Processing your request...");

    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${userMessage}\n\nDocument Content:\n${content}` }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      if (!data || typeof data.suggestion !== 'string') {
        throw new Error('Invalid response format from AI service');
      }

      setAiMessage(data.suggestion);
      setUserMessage('');
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setAiMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "The AI service is currently unavailable. Please try again in a few minutes."
      );
    } finally {
      setIsImproving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAssistantMessage();
    }
  };

  const customButtonStyle = {
    saveButton: "bg-[#FFD700] text-black hover:bg-[#E6C200] dark:text-black",
    loadButton: "bg-[#FF5733] text-white hover:bg-[#E64D2E]"
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 mr-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document Title"
            className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 w-full"
            disabled={isLoading}
          />
          {saveStatus && (
            <p className={`text-sm mt-1 ${
              saveStatus.includes('Error') ? 'text-red-500' : 
              saveStatus === 'Loading...' || saveStatus === 'Saving...' ? 'text-blue-500' : 
              'text-green-500'
            }`}>
              {saveStatus}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            className={customButtonStyle.saveButton}
            size="sm" 
            onClick={saveDocument}
            disabled={isSaving || isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Document'}
          </Button>

          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAISuggestion}
            disabled={isImproving || isLoading}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {isImproving ? 'Improving...' : 'Improve'}
          </Button>
          <Button
            variant={showAiAssistant ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowAiAssistant(!showAiAssistant)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Button
            variant={showVersions ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowVersions(!showVersions)}
          >
            <Clock className="w-4 h-4 mr-2" />
            Versions
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-4 h-[calc(100%-3rem)]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Select 
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="w-full mr-2"
              disabled={isLoading}
            >
              <option value="empty">Select a template...</option>
              <option value="contract">Contract Template</option>
              <option value="agreement">Agreement Template</option>
              <option value="resume">Resume Template</option>
            </Select>
            <Button
              onClick={handleAISuggestion}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isImproving || isLoading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Suggestion
            </Button>
          </div>
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isLoading ? "Loading..." : "Start typing your document..."}
            className="w-full h-[calc(100%-4rem)] resize-none"
            disabled={isLoading}
          />
        </div>

        {showAiAssistant && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4">AI Assistant</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-[calc(100vh-20rem)] overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{aiMessage}</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 p-2 text-sm"
                  disabled={isImproving || isLoading}
                />
                <Button 
                  size="sm" 
                  onClick={handleAssistantMessage}
                  disabled={isImproving || isLoading}
                >
                  {isImproving ? '...' : 'Send'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showVersions && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Version History</h3>
              {!isReadOnly && (
                <Button
                  size="sm"
                  onClick={saveVersion}
                  variant="outline"
                >
                  Save Version
                </Button>
              )}
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{version.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(version.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!isReadOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => restoreVersion(version)}
                      >
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {versions.length === 0 && (
                <p className="text-sm text-gray-500 text-center">
                  No versions saved yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentEditor;