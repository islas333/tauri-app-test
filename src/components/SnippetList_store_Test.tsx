import { readDir } from "@tauri-apps/api/fs"
import { useEffect } from "react"
import { desktopDir } from "@tauri-apps/api/path";
import { useSnippetStore } from '../store/SnippetsStore'

import { create } from 'zustand'


type Store = {
  count: number
  updateCount: (newCount: number) => void
  author: string
  inc: () => void
}

const useStore = create<Store>()((set) => ({
  count: 5,
  author: 'shawn',
  inc: () => set((state) => ({ count: state.count + 1 })),
  updateCount: (newCount: number) => {
    set({ count: newCount })
  }
}))


function SnippetList() {

  const setSnippetsNames = useSnippetStore((state) => state.setSnippetsNames)
  const snippetsNames = useSnippetStore((state) => state.snippetsNames)
  const s_count = useStore((state) => state.count)
  const f_count = useStore(state => state.updateCount)
  f_count(10)

  useEffect(() => {
    async function loadFiles() {
      const desktopPath = await desktopDir()
      const list = await readDir(`${desktopPath}/tauri`)
      const names = list.map(file => file.name!)
      console.log(names)
      setSnippetsNames(names)
      console.log(s_count)
      f_count(12)
    }
    loadFiles()
  }, [])

  return (
    <div>
      {snippetsNames.map((name) => (
        <div key={name} className="p-4 border-b border-zinc-800">
          {name}
        </div>
      ))}
    </div>
  )
}

export default SnippetList