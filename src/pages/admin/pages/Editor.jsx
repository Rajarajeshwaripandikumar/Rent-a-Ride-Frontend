// src/pages/admin/pages/Editor.jsx
import { useState } from "react";
import RichTextEditor from "../../../components/RichTextEditor"; // adjust path if needed

const Editor = () => {
  const [content, setContent] = useState("");

  return (
    <div className="mt-6 px-4 sm:px-6 lg:px-8 select-none">
      {/* PAGE HEADER */}
      <div className="mb-6">
        <span
          className="
            inline-flex items-center px-2 py-[2px]
            text-[11px] font-semibold uppercase tracking-[0.16em]
            text-[#1D4ED8] bg-[#EFF6FF]
            border border-[#BFDBFE]
            rounded-md
          "
        >
          Editor
        </span>

        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2">
          Rich Text Editor
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Create or edit content using the editor module.
        </p>
      </div>

      {/* CONTENT CARD */}
      <div
        className="
          bg-white
          rounded-2xl
          border border-gray-200
          shadow-sm
          p-5 sm:p-6 lg:p-8
        "
      >
        {/* Rich text editor (TipTap) */}
        <RichTextEditor value={content} onChange={setContent} />

        {/* Preview */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">
            Preview
          </p>
          {content ? (
            <div
              className="prose max-w-none text-gray-800 text-sm"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-gray-400 text-sm">
              Start typing in the editor to see the preview here…
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;
