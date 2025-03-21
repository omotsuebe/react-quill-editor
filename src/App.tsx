// App.tsx
import { useState } from 'react'
import CustomEditor from './editor/custom-editor.tsx'
import './App.css'

function App() {
  const [editorContent, setEditorContent] = useState('')

  const handleEditorChange = (content: string) => {
    setEditorContent(content)
    //console.log('Editor content changed:', content)
  }

  return (
    <div className="app-container">
      <h1>Quill Editor Example for React</h1>
      <div className="editor-wrapper">
        <CustomEditor
          value={editorContent}
          onChange={handleEditorChange}
          placeholder="Start writing your content here..."
          readOnly={false}
        />
      </div>
    </div>
  )
}

export default App