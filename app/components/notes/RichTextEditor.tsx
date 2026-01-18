"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Highlighter,
  Plus,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function RichTextEditor(props: {
  initialContent: string;
  onChange: (content: string) => void;
}) {
  const { initialContent, onChange } = props;
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: "code-block-custom",
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Color,
      TextStyle,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      setShowTableMenu(editor.isActive("table"));
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-stone prose-lg max-w-none focus:outline-none min-h-[calc(100vh-300px)] px-12 py-8 text-stone-900",
        style: "color: #1c1917;",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const updateTableMenu = () => {
      setShowTableMenu(editor.isActive("table"));
    };

    editor.on("selectionUpdate", updateTableMenu);
    editor.on("transaction", updateTableMenu);

    return () => {
      editor.off("selectionUpdate", updateTableMenu);
      editor.off("transaction", updateTableMenu);
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-12 flex items-center justify-center">
        <p className="text-stone-500 text-sm">Loading editor...</p>
      </div>
    );
  }

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const textColors = [
    "#000000",
    "#EF4444",
    "#10B981",
    "#3B82F6",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
  ];
  const highlightColors = [
    "#FEF3C7",
    "#FEE2E2",
    "#DBEAFE",
    "#D1FAE5",
    "#FCE7F3",
    "#E9D5FF",
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-emerald-200 overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="border-b border-emerald-100 bg-stone-50 p-2 flex flex-wrap gap-1 flex-shrink-0">
        <div className="flex gap-1 pr-2 border-r border-stone-300">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive("bold") ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive("italic") ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive("underline") ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive("strike") ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive("code") ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 pr-2 border-r border-stone-300">
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive("heading", { level: 1 }) ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive("heading", { level: 3 }) ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 pr-2 border-r border-stone-300 relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${showColorPicker ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-stone-300 rounded-lg shadow-lg p-2 flex gap-1 z-20">
              {textColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded border-2 border-stone-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className="w-6 h-6 rounded border-2 border-stone-300 hover:scale-110 transition-transform bg-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-1 pr-2 border-r border-stone-300 relative">
          <button
            onClick={() => setShowHighlightPicker(!showHighlightPicker)}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${showHighlightPicker ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-stone-300 rounded-lg shadow-lg p-2 flex gap-1 z-20">
              {highlightColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    editor.chain().focus().setHighlight({ color }).run();
                    setShowHighlightPicker(false);
                  }}
                  className="w-6 h-6 rounded border-2 border-stone-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setShowHighlightPicker(false);
                }}
                className="w-6 h-6 rounded border-2 border-stone-300 hover:scale-110 transition-transform bg-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-1 pr-2 border-r border-stone-300">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive("bulletList") ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive("orderedList") ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 pr-2 border-r border-stone-300">
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive({ textAlign: "left" }) ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive({ textAlign: "center" }) ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive({ textAlign: "right" }) ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive({ textAlign: "justify" }) ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 pr-2 border-r border-stone-300">
          <button
            onClick={addLink}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive("link") ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={addImage}
            className="p-2 rounded hover:bg-emerald-50 transition-colors text-stone-700"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            onClick={addTable}
            className="p-2 rounded hover:bg-emerald-50 transition-colors text-stone-700"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 pr-2 border-r border-stone-300">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-emerald-50 transition-colors ${editor.isActive("blockquote") ? "bg-emerald-100 text-emerald-700" : "text-stone-700"}`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 rounded hover:bg-emerald-50 transition-colors text-stone-700"
            title="Horizontal Rule"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="p-2 rounded hover:bg-emerald-50 transition-colors text-stone-700 disabled:opacity-50"
            title="Undo"
            disabled={!editor.can().undo()}
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="p-2 rounded hover:bg-emerald-50 transition-colors text-stone-700 disabled:opacity-50"
            title="Redo"
            disabled={!editor.can().redo()}
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Controls - Icon-Only, Compact */}
      {showTableMenu && (
        <div className="border-b border-emerald-300 bg-emerald-50 px-3 py-1.5 flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="p-1.5 rounded bg-white hover:bg-emerald-100 transition-colors border border-emerald-200"
            title="Add Row Above"
          >
            <div className="flex flex-col items-center">
              <Plus className="w-3 h-3 text-emerald-700" />
              <div className="w-4 h-0.5 bg-emerald-700 mt-0.5" />
            </div>
          </button>

          <button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="p-1.5 rounded bg-white hover:bg-emerald-100 transition-colors border border-emerald-200"
            title="Add Row Below"
          >
            <div className="flex flex-col items-center">
              <div className="w-4 h-0.5 bg-emerald-700 mb-0.5" />
              <Plus className="w-3 h-3 text-emerald-700" />
            </div>
          </button>

          <button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="p-1.5 rounded bg-white hover:bg-emerald-100 transition-colors border border-emerald-200"
            title="Add Column Left"
          >
            <div className="flex items-center">
              <Plus className="w-3 h-3 text-emerald-700" />
              <div className="w-0.5 h-4 bg-emerald-700 ml-0.5" />
            </div>
          </button>

          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="p-1.5 rounded bg-white hover:bg-emerald-100 transition-colors border border-emerald-200"
            title="Add Column Right"
          >
            <div className="flex items-center">
              <div className="w-0.5 h-4 bg-emerald-700 mr-0.5" />
              <Plus className="w-3 h-3 text-emerald-700" />
            </div>
          </button>

          <div className="w-px h-4 bg-emerald-400 mx-1" />

          <button
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="p-1.5 rounded bg-white hover:bg-red-50 transition-colors border border-red-200"
            title="Delete Row"
          >
            <div className="flex flex-col items-center">
              <X className="w-3 h-3 text-red-600" />
              <div className="w-4 h-0.5 bg-red-600 mt-0.5" />
            </div>
          </button>

          <button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="p-1.5 rounded bg-white hover:bg-red-50 transition-colors border border-red-200"
            title="Delete Column"
          >
            <div className="flex items-center">
              <X className="w-3 h-3 text-red-600" />
              <div className="w-0.5 h-4 bg-red-600 ml-0.5" />
            </div>
          </button>

          <button
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="ml-auto p-1.5 rounded bg-red-500 hover:bg-red-600 transition-colors text-white flex items-center gap-1"
            title="Delete Table"
          >
            <TableIcon className="w-3 h-3" />
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-y-auto bg-stone-50">
        <style jsx global>{`
          .ProseMirror table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
            overflow: hidden;
          }

          .ProseMirror table td,
          .ProseMirror table th {
            border: 2px solid #d6d3d1;
            padding: 0.5em 0.75em;
            position: relative;
            min-width: 100px;
          }

          .ProseMirror table th {
            background-color: #f5f5f4;
            font-weight: 600;
            text-align: left;
          }

          .ProseMirror table td {
            background-color: white;
          }

          .ProseMirror table .selectedCell {
            background-color: #d1fae5;
          }

          .ProseMirror code {
            background-color: #fef3c7;
            color: #92400e;
            padding: 0.2em 0.4em;
            border-radius: 0.25em;
            font-size: 0.9em;
            font-family: "Courier New", monospace;
            font-weight: 500;
            border: 1px solid #fde68a;
          }

          .ProseMirror pre {
            background-color: #1c1917;
            color: #10b981;
            padding: 1em;
            border-radius: 0.5em;
            overflow-x: auto;
            font-family: "Courier New", monospace;
            margin: 1em 0;
          }

          .ProseMirror pre code {
            background: none;
            border: none;
            padding: 0;
            color: inherit;
          }

          .ProseMirror {
            color: #1c1917;
          }

          .ProseMirror p {
            color: #1c1917;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
