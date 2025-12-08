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
        heading: { levels: [1, 2, 3] },

        // 🔐 IMPORTANT: prevent StarterKit from registering its own link/underline
        link: false,
        underline: false,
      }),

      // ✅ our single underline extension
      Underline,

      // ✅ our single link extension
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
      }),

      // ✅ text alignment
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const html = editor.getHTML();
    if (value !== html) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const toggleLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", prev || "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  const button = (label, active, onClick, extra = "") => (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-2 py-1 rounded text-xs border border-transparent
        ${active ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}
        ${extra}
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b bg-gray-50 text-sm">
        {/* Heading selector */}
        <select
          className="border border-gray-300 rounded px-1 py-1 text-xs bg-white"
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
        {button("B", editor.isActive("bold"), () =>
          editor.chain().focus().toggleBold().run()
        )}
        {button("I", editor.isActive("italic"), () =>
          editor.chain().focus().toggleItalic().run()
        )}
        {button("U", editor.isActive("underline"), () =>
          editor.chain().focus().toggleUnderline().run()
        )}
        {button("S", editor.isActive("strike"), () =>
          editor.chain().focus().toggleStrike().run()
        )}

        {/* Ordered / Bullet list */}
        {button("1.", editor.isActive("orderedList"), () =>
          editor.chain().focus().toggleOrderedList().run()
        )}
        {button("•", editor.isActive("bulletList"), () =>
          editor.chain().focus().toggleBulletList().run()
        )}

        {/* Text Alignment */}
        {button("L", editor.isActive({ textAlign: "left" }), () =>
          editor.chain().focus().setTextAlign("left").run()
        )}
        {button("C", editor.isActive({ textAlign: "center" }), () =>
          editor.chain().focus().setTextAlign("center").run()
        )}
        {button("R", editor.isActive({ textAlign: "right" }), () =>
          editor.chain().focus().setTextAlign("right").run()
        )}
        {button("J", editor.isActive({ textAlign: "justify" }), () =>
          editor.chain().focus().setTextAlign("justify").run()
        )}

        {/* Link button */}
        {button("Link", editor.isActive("link"), toggleLink)}

        {/* Clean formatting */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
          className="ml-auto px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-200"
        >
          Clean
        </button>
      </div>

      {/* Content */}
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
