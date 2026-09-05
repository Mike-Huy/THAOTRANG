import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Quote, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link as LinkIcon, 
  Heading3, 
  Heading4, 
  Heading5, 
  Eraser, 
  Code,
  Eye
} from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Nhập nội dung chi tiết...' }) => {
  const editorRef = useRef(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value || '');

  useEffect(() => {
    if (value !== htmlContent) {
      setHtmlContent(value || '');
      if (editorRef.current && !isSourceMode) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  useEffect(() => {
    if (editorRef.current && !isSourceMode && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [isSourceMode]);

  const execCmd = (command, valueArg = null) => {
    document.execCommand(command, false, valueArg);
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtmlContent(newHtml);
      onChange(newHtml);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtmlContent(newHtml);
      onChange(newHtml);
    }
  };

  const handleSourceChange = (e) => {
    const val = e.target.value;
    setHtmlContent(val);
    onChange(val);
  };

  const addLink = () => {
    const url = prompt('Nhập đường dẫn (URL):', 'https://');
    if (url) {
      execCmd('createLink', url);
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col focus-within:border-[#00c853] focus-within:ring-4 focus-within:ring-[#00c853]/5 transition-all">
      {/* Toolbar */}
      <div className="bg-gray-50/90 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 select-none">
        <button
          type="button"
          onClick={() => execCmd('bold')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all"
          title="In đậm (Bold)"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd('italic')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all"
          title="In nghiêng (Italic)"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd('underline')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all"
          title="Gạch chân (Underline)"
        >
          <Underline size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd('strikeThrough')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all"
          title="Gạch ngang (Strikethrough)"
        >
          <Strikethrough size={15} />
        </button>

        <div className="w-[1px] h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => execCmd('formatBlock', '<h3>')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all text-xs font-bold"
          title="Tiêu đề lớn (H3)"
        >
          <Heading3 size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', '<h4>')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all text-xs font-bold"
          title="Tiêu đề vừa (H4)"
        >
          <Heading4 size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', '<h5>')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all text-xs font-bold"
          title="Tiêu đề nhỏ (H5)"
        >
          <Heading5 size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', '<p>')}
          className="px-2 py-1 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all text-[11px] font-bold"
          title="Đoạn văn (Paragraph)"
        >
          Thường
        </button>

        <div className="w-[1px] h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => execCmd('insertUnorderedList')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all"
          title="Danh sách gạch đầu dòng"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd('insertOrderedList')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all"
          title="Danh sách số"
        >
          <ListOrdered size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', '<blockquote>')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all"
          title="Trích dẫn (Quote)"
        >
          <Quote size={15} />
        </button>

        <div className="w-[1px] h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => execCmd('justifyLeft')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all"
          title="Căn trái"
        >
          <AlignLeft size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd('justifyCenter')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all"
          title="Căn giữa"
        >
          <AlignCenter size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd('justifyRight')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all"
          title="Căn phải"
        >
          <AlignRight size={15} />
        </button>

        <div className="w-[1px] h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={addLink}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all"
          title="Chèn đường dẫn (Link)"
        >
          <LinkIcon size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd('removeFormat')}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-black transition-all text-red-500"
          title="Xóa định dạng"
        >
          <Eraser size={15} />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsSourceMode(!isSourceMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
              isSourceMode ? 'bg-[#00c853] text-white shadow-sm' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title="Chuyển đổi chế độ soạn thảo / mã nguồn HTML"
          >
            {isSourceMode ? <Eye size={13} /> : <Code size={13} />}
            <span>{isSourceMode ? 'Xem RichText' : 'Mã HTML'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isSourceMode ? (
        <textarea
          rows={8}
          className="w-full p-4 text-xs font-mono bg-gray-900 text-green-400 outline-none resize-none leading-relaxed"
          value={htmlContent}
          onChange={handleSourceChange}
          placeholder="<h1>Mã HTML...</h1>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="min-h-[160px] p-4 text-sm outline-none leading-relaxed focus:outline-none overflow-y-auto"
          style={{ minHeight: '160px' }}
        />
      )}
    </div>
  );
};

export default RichTextEditor;
