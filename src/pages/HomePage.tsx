import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import HumanizerTool from '../components/humanizer/HumanizerTool';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Make AI Text Undetectable
            </h1>
            <p className="text-xl mb-8 text-indigo-100">
              Transform AI-generated content into natural, human-like text that bypasses AI detection tools.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const el = document.getElementById("tool");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                iconPosition="right"
                className="bg-transparent text-white hover:bg-white/10"
              >
                Try Tool
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Humanize AI?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI humanization technology ensures your content passes detection tests while maintaining quality and meaning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                <ShieldCheck size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Undetectable Results</h3>
              <p className="text-gray-600">
                Our advanced algorithms rewrite your content to bypass even the most sophisticated AI detection tools.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                <Zap size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Lightning Fast</h3>
              <p className="text-gray-600">
                Process thousands of words in seconds with our optimized technology, saving you valuable time.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                <Award size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Quality Preserved</h3>
              <p className="text-gray-600">
                Maintain the original meaning and quality of your content while making it undetectable to AI tools.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Tool Section */}
      <div id="tool">
      <section id="tool" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Try Our AI Humanizer</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the power of our AI humanization technology. Paste your text below to see the difference.
            </p>
          </div>
          
          <HumanizerTool />
        </div>
      </section>
      </div>
      
      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Humanize Your AI Content?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-indigo-100">
            Sign up today and get access to our powerful AI humanization tools. Start with a free trial!
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;