/* eslint-disable react/display-name */
import {ChangeEvent, FormEvent, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";
import Image from "next/image";
import pauseIcon from "@/assets/ic_pause.svg";
import deepseekIcon from "@/assets/ic_power_deepseek.svg";
import { SubmitButton } from "./SubmitButton";

const MAX_ROWS = 20;

interface MessageBoxProps {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callApp: Function;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  placeholder: string;
}

// Methods exposed to clients using useRef<MessageBoxHandles>
export interface MessageBoxHandles {
  clearInputValue: () => void;
  getTextValue: () => string;
  reset: () => void;
  resizeTextArea: () => void;
  focusTextarea: () => void;
  pasteText: (text: string) => void;
  askQuickQuestion: (text: string) => void;
}


const MessageBox = forwardRef<MessageBoxHandles, MessageBoxProps>(({ loading, setLoading, callApp, placeholder }, ref) => {

  const textValue = useRef('');
  const [isTextEmpty, setIsTextEmpty] = useState(true);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const resizeTimeoutRef = useRef<number | null>(null);
  const [isComposing, setComposing] = useState(false);

  const setTextValue = (value: string) => {
    textValue.current = value;
  }

  const setTextAreaValue = (value: string) => {
    if (textAreaRef.current) {
      textAreaRef.current.value = value;
    }
    setIsTextEmpty(textAreaRef.current?.value.trim() === '');
    debouncedResize();
  }

  useImperativeHandle(ref, () => ({
    // Method to clear the textarea
    clearInputValue: () => {
      clearValueAndUndoHistory(textAreaRef);
    },
    getTextValue: () => {
      return textValue.current;
    },
    reset: () => {
      clearValueAndUndoHistory(textAreaRef);
      setTextValue('');
      setTextAreaValue('');
    },
    resizeTextArea: () => {
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    },
    focusTextarea: () => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    },
    pasteText: (text: string) => {
      insertTextAtCursorPosition(text);
    },
    askQuickQuestion: (text: string) => {
      setTextValue("");
      setTextAreaValue("");
      insertTextAtCursorPosition(text);
      if (textAreaRef.current) {
        setTextValue(textAreaRef.current.value);
      }
      callApp(textAreaRef.current?.value || '', []);
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    },
  }));

  // Function to handle auto-resizing of the textarea
  const handleAutoResize = useCallback(() => {
    if (textAreaRef.current) {
      const target = textAreaRef.current;
      const maxHeight = parseInt(getComputedStyle(target).lineHeight || '0', 10) * MAX_ROWS;

      target.style.height = 'auto';
      if (target.scrollHeight <= maxHeight) {
        target.style.height = `${target.scrollHeight}px`;
      } else {
        target.style.height = `${maxHeight}px`;
      }
    }
  }, []);

  // Debounced resize function
  const debouncedResize = useCallback(() => {
    if (resizeTimeoutRef.current !== null) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = window.setTimeout(() => {
      handleAutoResize();
    }, 100); // Adjust the debounce time as needed
  }, []);

  const handleTextValueUpdated = () => {
    debouncedResize();

    // After resizing, scroll the textarea to the insertion point (end of the pasted text).
    if (textAreaRef.current) {
      const textarea = textAreaRef.current;
      // Check if the pasted content goes beyond the max height (overflow scenario)
      if (textarea.scrollHeight > textarea.clientHeight) {
        // Scroll to the bottom of the textarea
        textarea.scrollTop = textarea.scrollHeight;
      }
    }
  };

  function clearValueAndUndoHistory(textAreaRef: React.RefObject<HTMLTextAreaElement | null>) {
    setTextValue('');
    setTextAreaValue('');
  }

  const insertTextAtCursorPosition = (textToInsert: string) => {
    if (textAreaRef.current) {
      const textArea = textAreaRef.current;
      const startPos = textArea.selectionStart || 0;
      const endPos = textArea.selectionEnd || 0;
      const text = textArea.value;
      const newTextValue =
        text.substring(0, startPos) +
        textToInsert +
        text.substring(endPos);

      // Update the state with the new value
      setTextValue(newTextValue);
      setTextAreaValue(newTextValue);

      // Dispatch a new InputEvent for the insertion of text
      // This event should be undoable
      // const inputEvent = new InputEvent('input', {
      //   bubbles: true,
      //   cancelable: true,
      //   inputType: 'insertText',
      //   data: textToInsert,
      // });
      // textArea.dispatchEvent(inputEvent);

      // Move the cursor to the end of the inserted text
      const newCursorPos = startPos + textToInsert.length;
      setTimeout(() => {
        textArea.selectionStart = newCursorPos;
        textArea.selectionEnd = newCursorPos;
        // Scroll to the insertion point after the DOM update
        if (textArea.scrollHeight > textArea.clientHeight) {
          textArea.scrollTop = textArea.scrollHeight;
        }
      }, 0);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {

    //   if (event.clipboardData && event.clipboardData.items) {
    // const items = Array.from(event.clipboardData.items);

    // for (const item of items) {
    //   if (item.type.indexOf("image") === 0 && allowImageAttachment !== 'no') {
    //     event.preventDefault();
    //     const file = item.getAsFile();
    //     if (file) {
    //       const reader = new FileReader();
    //       reader.onload = (loadEvent) => {
    //         if (loadEvent.target !== null) {
    //           const base64Data = loadEvent.target.result;

    //           if (typeof base64Data === 'string') {
    //             preprocessImage(file, (base64Data, processedFile) => {
    //               setFileDataRef((prevData) => [...prevData, {
    //                 id: 0,
    //                 fileData: {
    //                   data: base64Data,
    //                   type: processedFile.type,
    //                   source: 'pasted',
    //                   filename: 'pasted-image',
    //                 }
    //               }]);
    //             });
    //             if (allowImageAttachment == 'warn') {
    //               // todo: could warn user
    //             }
    //           }
    //         }
    //       };
    //       reader.readAsDataURL(file);
    //     }
    //   } else {
    //   }
    // }
    //   }

    // Get the pasted text from the clipboard
    //   const pastedText = event.clipboardData.getData('text/plain');
  };

  const handleCompositionStart = () => {
    setComposing(true);
  }

  const handleCompositionEnd = () => {
    setComposing(false);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkForSpecialKey = (e: any) => {
    const isEnter = (e.key === 'Enter' && !isComposing);

    if (isEnter) {
      if (e.shiftKey) {
        return;
      } else {
        if (!loading) {
          e.preventDefault();
          if (textAreaRef.current) {
            setTextValue(textAreaRef.current.value);
          }
          callApp(textAreaRef.current?.value || '', []);
        }
      }
    }
  };

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setIsTextEmpty(textAreaRef.current?.value.trim() === '');
    handleTextValueUpdated();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (textAreaRef.current) {
      setTextValue(textAreaRef.current.value);
    }
    callApp(textAreaRef.current?.value || '', []);
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }
  };

  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // ChatService.cancelStream();
    setLoading(false);
  };

  const customStyle = () => {
    if (placeholder.startsWith("Ask")) {
      return { borderRadius: "24px", border: isTextEmpty ? "1px solid #00000012" : "1px solid #00000012" }
    }
    return { borderRadius: "24px", border: isTextEmpty ? "1px solid #e4e4e7" : "1px solid #e4e4e7" }
  }

  // const handleResize = () => {
  //   const activeElement = document.activeElement as HTMLElement | null;
  //
  //   if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
  //     setTimeout(() => {
  //       activeElement.scrollIntoView({
  //         behavior: 'smooth',
  //         block: 'center',
  //       });
  //     }, 200);
  //   }
  // };
  //
  // useEffect(() => {
  //   window.addEventListener('resize', handleResize);
  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []);

      // useEffect(() => {
      //   const onViewportResize = () => {
      //     const activeElement = document.activeElement as HTMLElement | null;
      //     if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
      //       activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      //     }
      //   };
      //
      //   if (window.visualViewport) {
      //     window.visualViewport.addEventListener('resize', onViewportResize);
      //   }
      //
      //   return () => {
      //     if (window.visualViewport) {
      //       window.visualViewport.removeEventListener('resize', onViewportResize);
      //     }
      //   };
      // }, []);

      useEffect(() => {
        const handleResize = () => {
          const activeElement = document.activeElement as HTMLElement | null;

          if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
            setTimeout(() => {
              activeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }, 0);
          }
        };

        const handleBlur = () => {
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 0);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('blur', handleBlur, true);

        return () => {
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('blur', handleBlur, true);
        };
      }, []);


      return (
    <div
      style={{ zIndex: '3' }}
      className="w-full !bg-transparent pt-2 z-3 px-3 md:px-0 pb-6 ">
      <form onSubmit={handleSubmit}
        className={`stretch flex flex-row mx-auto md:max-w-3xl bg-white_70 shadow-border-input`}
        style={customStyle()}>
        <div className="w-full flex flex-row min-h-20 md:min-h-[106px] pb-1">
          <div id="message-box-border" className="relative flex flex-col h-full flex-1 w-full pb-2 flex-grow bg-gray-850 text-primary2">
            {/* Container for Textarea and Buttons */}
            <div className="flex justify-center items-start w-full flex-1 relative space-x-2 py-2">

              {/* Textarea */}
              <textarea
                id="sendMessageInput"
                name="message"
                tabIndex={0}
                ref={textAreaRef}
                rows={1}
                className="flex-auto m-0 resize-none border-0 bg-transparent px-4.5 focus:ring-0 focus-visible:ring-0 outline-none shadow-none placeholder-[#b6b6b6] color-black"
                placeholder={placeholder}
                onKeyDown={checkForSpecialKey}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                onChange={handleTextChange}
                onPaste={handlePaste}
                style={{ minWidth: 0, maxHeight: '120px' }}
              ></textarea>
            </div>
            {/* <div className="w-[36px] h-[36px] flex flex-row justify-center items-center ml-4 rounded-full border border-[#e4e4e7]">
              <Image src={deepseekIcon as string} alt={""} />
            </div> */}
          </div>

          {/* Cancel/Submit Button */}
          <div className="flex items-end justify-end mb-1 md:mb-2">
            {
              loading ? (
                <button
                  onClick={(e) => handleCancel(e)}
                  className="mr-3 md:mr-4 text-primary2  w-9 h-9">
                  <Image src={pauseIcon as string} alt={""} />
                </button>
              ) : <SubmitButton
                disabled={isTextEmpty || loading}
                loading={loading}
              />
            }
          </div>
        </div>
      </form>
    </div>
  );
}
);

export default MessageBox;