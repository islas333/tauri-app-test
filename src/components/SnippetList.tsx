import { readDir } from "@tauri-apps/api/fs"
import { useEffect } from "react"
import { desktopDir } from "@tauri-apps/api/path"
import { useSnippetStore } from '../store/SnippetsStore'
import SnippetItem from './SnippetItem';


function SnippetList() {

  const setSnippetsNames = useSnippetStore((state) => state.setSnippetsNames)
  const snippetsNames = useSnippetStore((state) => state.snippetsNames)

  useEffect(() => {
    async function loadFiles() {
      const desktopPath = await desktopDir()
      const list = await readDir(`${desktopPath}/tauri`)
      const names = list.map(file => file.name!)
      console.log(list)
      setSnippetsNames(names)
    }
    loadFiles()
  }, [])

  return (
    <ul>
      {snippetsNames
      .filter(name => name !== '.DS_Store')
      .map((name) => (
        <SnippetItem key={name} file={name} />
      ))}
    </ul>
  )
}

export default SnippetList