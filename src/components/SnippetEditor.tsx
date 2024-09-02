import Editor from '@monaco-editor/react'
import { useSnippetStore } from '../store/SnippetsStore'
import { useEffect, useState } from 'react'
import { writeFile } from '@tauri-apps/api/fs';
import { desktopDir } from "@tauri-apps/api/path"

function SnippetEditor() {

  const fileSelected = useSnippetStore((state) => state.selectedSnippet)
  const [text, setText] = useState<string|undefined>('')
  const codigoSnippet = useSnippetStore((state) => state.selectedSnippet?.code)

  useEffect(() => {
    const saveText = setTimeout(async () => {
      if (!fileSelected) return
      const desktopPath = await desktopDir()
      // console.log(fileSelected)
      await writeFile(`${desktopPath}/tauri/${fileSelected.name}`, text ?? "")
      console.log("save text")
    } , 1000)

    return () => {
      clearTimeout(saveText)
    }

  } , [text])

  return (
    <>
      {fileSelected ? (
        <Editor
          theme='vs-dark'
          defaultLanguage='javascript'
          options={{
            fontSize: 16,
          }}
          value={codigoSnippet ?? ""}
          onChange={(value) => {
            setText(value)
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <h1 className="text-2xl text-neutral-500">No file selected</h1>
        </div>
      )}
    </>
  )
}

export default SnippetEditor