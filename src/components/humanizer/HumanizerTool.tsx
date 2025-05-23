import React, { useState } from 'react';
import { ArrowRight, Copy, Save, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { supabase } from '../../lib/supabase';

const HumanizerTool: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [title, setTitle] = useState('');
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, fetchUserProfile } = useAuthStore();
  const { createProject } = useProjectStore();
  
  const humanizeText = async () => {
    if (!inputText.trim()) return;
    if (inputText.length < 50) {
      setError('Text must be at least 50 characters long.');
      return;
    }
    await fetchUserProfile(); // Always get the latest credits
    const latestUser = useAuthStore.getState().user;
    if (!latestUser || latestUser.credits < 5) {
      setError('You are out of credits. Please buy more to humanize text.');
      return;
    }
    setIsHumanizing(true);
    setError(null);
    setOutputText('');

    const API_URL = 'https://humanize.undetectable.ai';
    const API_KEY = 'dd410c04-f157-4f4c-9e41-b7d125f2b339'; // TODO: Replace with your actual API key or use env

    try {
      // 1. Submit document
      const submitRes = await fetch(`${API_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify({
          content: inputText,
          readability: 'High School',
          purpose: 'General Writing',
          strength: 'More Human',
          model: 'v11',
        }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.error || 'Failed to submit document');
      const docId = submitData.id;

      // 2. Poll for result
      let output = null;
      for (let i = 0; i < 20; i++) { // Poll up to 20 times (about 2 minutes)
        await new Promise(res => setTimeout(res, 7000)); // Wait 7 seconds
        const docRes = await fetch(`${API_URL}/document`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY,
          },
          body: JSON.stringify({ id: docId }),
        });
        const docData = await docRes.json();
        if (docData.output) {
          output = docData.output;
          break;
        }
        if (docData.error) {
          throw new Error(docData.error);
        }
      }
      if (!output) throw new Error('Timed out waiting for humanized text');
      setOutputText(output);
      // Subtract 5 credits from user in Supabase using latest value
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: latestUser.credits - 5 })
        .eq('id', latestUser.id);
      if (creditError) throw creditError;
      await fetchUserProfile();
      // Generate a title based on the first few words
      if (!title) {
        const words = inputText.split(' ').slice(0, 3).join(' ');
        setTitle(`${words}...`);
      }
    } catch (error: any) {
      console.error('Error humanizing text:', error);
      setError(error.message || 'Failed to humanize text');
    } finally {
      setIsHumanizing(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  const handleSave = async () => {
    if (!user) return;
    
    try {
      await createProject(
        title || 'Untitled Project',
        inputText,
        outputText
      );
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project');
    }
  };
  
  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setTitle('');
    setError(null);
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Credits Tracker */}
      <div className="col-span-2 mb-6 flex items-center justify-center">
        <div className="flex items-center bg-green-50 border border-green-200 rounded px-4 py-2">
          <span className="text-green-700 font-semibold mr-2">Credits:</span>
          <span className="text-green-900 font-bold text-lg">{user?.credits ?? 0}</span>
        </div>
      </div>
      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col h-full"
      >
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Original Text</h2>
        <p className="text-gray-600 mb-4">
          Paste your AI-generated text here to humanize it.
        </p>
        
        <div className="relative flex-grow">
          <TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here..."
            className="h-80 resize-none mb-4"
            autoFocus={true}
          />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {inputText.length} characters
            </div>
            <Button
              onClick={humanizeText}
              disabled={!inputText.trim() || isHumanizing}
              loading={isHumanizing}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
            >
              Humanize
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Output Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col h-full"
      >
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Humanized Text</h2>
        <p className="text-gray-600 mb-4">
          Your humanized text will appear here.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="relative flex-grow">
          <TextArea
            value={outputText}
            onChange={(e) => setOutputText(e.target.value)}
            placeholder="Humanized text will appear here..."
            className="h-80 resize-none mb-4"
            readOnly={!outputText}
          />
          
          {outputText && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {outputText.length} characters
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  icon={<RefreshCw size={16} />}
                >
                  Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  icon={copySuccess ? <CheckCircle size={16} /> : <Copy size={16} />}
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </Button>
                {user && (
                  <Button
                    onClick={handleSave}
                    disabled={saveSuccess}
                    icon={saveSuccess ? <CheckCircle size={16} /> : <Save size={16} />}
                  >
                    {saveSuccess ? 'Saved!' : 'Save'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HumanizerTool;