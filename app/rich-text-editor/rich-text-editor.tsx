import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { EditorState } from "lexical";
import { Dispatch, SetStateAction } from "react";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import RichTextEditorConfig from "./config";

export default function RichTextEditor({
  defaultEditorState,
  onStateChange,
}: {
  defaultEditorState: string;
  onStateChange: Dispatch<SetStateAction<string>>;
}) {
  function onChange(editorState: EditorState) {
    const habitDescription = JSON.stringify(editorState.toJSON());
    onStateChange(habitDescription);
  }

  const editorConfig = {
    namespace: "RichTextEditor",
    editorState: defaultEditorState,
    ...RichTextEditorConfig,
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="min-h-32 outline-hidden py-[15px] px-2.5 border rounded-md focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring" />
        }
        placeholder={
          <div className="absolute top-[15px] left-[10px] pointer-events-none select-none">
            Enter a description...
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <OnChangePlugin onChange={onChange} />
    </LexicalComposer>
  );
}
