// src/components/RichTextEditor.jsx
import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";

const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange && onChange(html);
    },
  });

  // keep external `value` in sync (e.g., when loading existing content)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value != null && value !== current) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const toggleLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");

    // cancel
    if (url === null) return;

    // empty = unset
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar - mimicking your ReactQuill setup */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b bg-gray-50 text-sm">
        {/* Headers 1–3 */}
        <select
          className="border border-gray-300 rounded px-1 py-[3px] text-xs"
          onChange={(e) => {
            const level = Number(e.target.value);
            if (!level) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          value={
            editor.isActive("heading", { level: 1 })
              ? "1"
              : editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
              ? "3"
              : ""
          }
        >
          <option value="">Normal</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
        </select>

        {/* Bold / Italic / Underline / Strike */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-xs ${
            editor.isActive("bold") ? "bg-gray-200 font-semibold" : ""
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-xs ${
            editor.isActive("italic") ? "bg-gray-200 italic" : ""
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded text-xs ${
            editor.isActive("underline") ? "bg-gray-200 underline" : ""
          }`}
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded text-xs ${
            editor.isActive("strike") ? "bg-gray-200 line-through" : ""
          }`}
        >
          S
        </button>

        {/* Ordered / Bullet list */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-xs ${
            editor.isActive("orderedList") ? "bg-gray-200" : ""
          }`}
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-xs ${
            editor.isActive("bulletList") ? "bg-gray-200" : ""
          }`}
        >
          •
        </button>

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`px-2 py-1 rounded text-xs ${
            editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
          }`}
        >
          L
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`px-2 py-1 rounded text-xs ${
            editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
          }`}
        >
          C
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`px-2 py-1 rounded text-xs ${
            editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
          }`}
        >
          R
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`px-2 py-1 rounded text-xs ${
            editor.isActive({ textAlign: "justify" }) ? "bg-gray-200" : ""
          }`}
        >
          J
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={toggleLink}
          className={`px-2 py-1 rounded text-xs ${
            editor.isActive("link") ? "bg-gray-200" : ""
          }`}
        >
          Link
        </button>

        {/* Clean (clear formatting) */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
          className="ml-auto px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-100"
        >
          Clean
        </button>
      </div>

      {/* Content area: ~220px like your old ReactQuill */}
      <div className="px-3 py-2 bg-white">
        <div className="min-h-[220px] max-h-[280px] overflow-y-auto">
          <EditorContent
            editor={editor}
            className="prose max-w-none text-sm text-gray-800 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
