import { readDir } from "@tauri-apps/api/fs"
import { useEffect, useState } from "react"
import { desktopDir } from "@tauri-apps/api/path"
import { useSnippetStore } from '../store/SnippetsStore'
import SnippetItem from './SnippetItem';
import { invoke } from '@tauri-apps/api/tauri'


interface Patient {
  id: number;
  name: string;
  age: number;
}

function SnippetList() {

  const setSnippetsNames = useSnippetStore((state) => state.setSnippetsNames)
  const snippetsNames = useSnippetStore((state) => state.snippetsNames)
  const [snippetName, setSnippetName] = useState<string>('')

  async function addUser(name: string, data: string) {
    try {
      await invoke('insert_user', { name: name, code: data });
      alert('User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
    }
  }

  const handleGetAll = async () => {
    try {
      const snippets: Array<{ name: string }> = await invoke('get_snippets');
      console.log('snippets:', snippets);

      const getv2: Array<{ name: string }> = await invoke('get_v2');
      console.log('getv2:', getv2);

      const patient = await invoke<Patient>('get_patient', { id: 2 });
      console.log(`Edad del paciente: ${patient.name}`); 

      setSnippetName(snippets[0].name)
    } catch (error) {
      console.error('Error getting snippets:', error);
    }
  }

  const handleInsert = async () => {
    addUser("tito", "developer")
  }

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
      <button className="bg-zinc-800 w-full p-4"
        onClick={() => {
          handleInsert()
        }}
      >Add data Snippet</button>
      <button className="bg-zinc-800 w-full p-4"
        onClick={() => {
          handleGetAll()
        }}
      >Read Snippet</button>
      <span>{snippetName}</span>
    </ul>
  )
}

export default SnippetList