import { create } from 'zustand';

interface Snippet {
  name: string;
  code: string | null;
}

interface SnippetState {
  snippetsNames: string[];
  selectedSnippet: Snippet | null;
  addSnippetName: (name: string) => void;
  setSnippetsNames: (names: string[]) => void;
  setSelectedSnippet: (snippet: Snippet | null) => void;
  removeSnippetName: (name: string) => void;
}

export const useSnippetStore = create<SnippetState>((set, get) => ({
  snippetsNames: [],
  selectedSnippet: null,
  addSnippetName: (name) => set((state) => ({
    snippetsNames: [...state.snippetsNames, name]
  })),
  setSnippetsNames: (names) => set({ snippetsNames: names }),
  setSelectedSnippet: (snippet) => set( { selectedSnippet: snippet } ),
  removeSnippetName : (name) => { 
    console.log(get())
    set((state) => ({
      snippetsNames: state.snippetsNames.filter(n => n !== name)
  }))}

}));