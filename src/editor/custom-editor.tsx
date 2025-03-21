import { forwardRef, useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './custom-editor.css';

interface CustomEditorProps {
  value?: string;
  id?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const CustomEditor = forwardRef<Quill, CustomEditorProps>(
  ({ value = '', onChange, readOnly = false, placeholder = 'Write something...' }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const isUserChangeRef = useRef<boolean>(false);
    const lastValueRef = useRef<string>(value);
    const [editorId] = useState(`quill-editor-${Math.random().toString(36).substring(2, 9)}`);

    // Completely destroy and recreate the editor container before initialization
    useEffect(() => {
      // Function to completely destroy any existing Quill instances
      const destroyQuill = () => {
        if (quillRef.current) {
          quillRef.current = null;
        }
        
        // Remove any existing toolbar elements in the document
        document.querySelectorAll('.ql-toolbar').forEach(toolbar => {
          toolbar.remove();
        });
        
        // Recreate editor container
        if (editorRef.current) {
          // Clear the container
          editorRef.current.innerHTML = '';
          // Create a fresh editor div
          const editorElement = document.createElement('div');
          editorElement.id = editorId;
          editorRef.current.appendChild(editorElement);
          return editorElement;
        }
        return null;
      };

      // Create fresh editor container
      const editorElement = destroyQuill();
      if (!editorElement) return;

      const modules = {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'script': 'sub' }, { 'script': 'super' }],
          [{ 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'direction': 'rtl' }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'align': [] }],
          ['link', 'image', 'video'],
          ['clean']
        ]
      };

      const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list',
        'script',
        'indent', 'direction',
        'color', 'background',
        'align',
        'link', 'image', 'video'
      ];

      // Initialize with the fresh container
      quillRef.current = new Quill(editorElement, {
        modules,
        formats,
        theme: 'snow',
        placeholder,
        readOnly,
      });

      // Set initial content
      if (value) {
        setQuillContent(quillRef.current, value);
        lastValueRef.current = value;
      }

      quillRef.current.on('text-change', (_delta, _oldDelta, source) => {
        if (source === 'user') {
          isUserChangeRef.current = true;
          if (quillRef.current) {
            const html = quillRef.current.root.innerHTML;
            lastValueRef.current = html;
            if (onChange) {
              onChange(html);
            }
          }
          isUserChangeRef.current = false;
        }
      });

      if (ref) {
        if (typeof ref === 'function') {
          ref(quillRef.current);
        } else {
          ref.current = quillRef.current;
        }
      }

      return () => {
        destroyQuill();
      };
    }, [editorId]); // Only depend on the stable editorId

    // Handle value prop changes
    useEffect(() => {
      if (quillRef.current && value !== lastValueRef.current && !isUserChangeRef.current) {
        setQuillContent(quillRef.current, value);
        lastValueRef.current = value;
      }
    }, [value]);

    // Update readOnly state if it changes
    useEffect(() => {
      if (quillRef.current) {
        quillRef.current.enable(!readOnly);
      }
    }, [readOnly]);

    const setQuillContent = (quill: Quill, content: string) => {
      try {
        const parsedContent = typeof content === 'string' && content.trim().startsWith('{')
          ? JSON.parse(content)
          : content;

        if (typeof parsedContent === 'object' && parsedContent.ops) {
          quill.setContents(parsedContent);
        } else {
          quill.root.innerHTML = content;
        }
      } catch (e) {
        console.error("Error parsing Quill content:", e);
        quill.root.innerHTML = content;
      }
    };

    return (
      <div className="custom-editor-container">
        <div ref={editorRef} className="quill-editor-container" />
      </div>
    );
  }
);

CustomEditor.displayName = 'CustomEditor';

export default CustomEditor;