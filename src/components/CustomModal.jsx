import { useEffect, useRef, useState } from "react";
import ReactDom from "react-dom";
import { IoCloseCircleOutline } from "react-icons/io5";
import PropTypes from "prop-types";

const Portal = ({ children }) => {
  return ReactDom.createPortal(children, document.body);
};

// Cinema-style Modal (UI only changed)

const Modal = ({
  children,
  isOpen,
  onClose,
  isDismissible = true,
  showCloseIcon = true,
  toAnimate = true,
  animationEnter = "zoomIn",
  animationExit = "zoomOut",
  className = "",
}) => {
  const modalRef = useRef();
  const [mouseDownEv, setMouseDownEv] = useState(null);

  useEffect(() => {
    if (!isOpen || !isDismissible) return;
    const checkEscAndCloseModal = (e) => {
      if (e.key !== "Escape") return;
      onClose();
    };
    document.addEventListener("keydown", checkEscAndCloseModal);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", checkEscAndCloseModal);
    };
  }, [isOpen, onClose, isDismissible]);

  const handleMouseDown = (e) => {
    setMouseDownEv({ screenX: e.screenX, screenY: e.screenY });
  };

  const checkOutsideAndCloseModal = (e) => {
    if (!isDismissible) return;
    if (
      modalRef.current.contains(e.target) ||
      Math.abs(mouseDownEv.screenX - e.screenX) > 15 ||
      Math.abs(mouseDownEv.screenY - e.screenY) > 15
    )
      return;
    onClose();
    setMouseDownEv(null);
  };

  const getEnterAnimation = (animEnter) => {
    return {
      slideInFromDown: "animate-[slideInFromDown_500ms_forwards]",
      slideInFromUp: "animate-[slideInFromUp_500ms_forwards]",
      slideInFromLeft: "animate-[slideInFromLeft_500ms_forwards]",
      slideInFromRight: "animate-[slideInFromRight_500ms_forwards]",
      zoomIn: "animate-[zoomIn_500ms_forwards]",
    }[animEnter];
  };

  const getExitAnimation = (animExit) => {
    return {
      slideOutToDown: "animate-[slideOutToDown_500ms_forwards]",
      slideOutToUp: "animate-[slideOutToUp_500ms_forwards]",
      slideOutToLeft: "animate-[slideOutToLeft_500ms_forwards]",
      slideOutToRight: "animate-[slideOutToRight_500ms_forwards]",
      zoomOut: "animate-[zoomOut_500ms_forwards]",
    }[animExit];
  };

  // Cinema dashboard modal base style (light, soft, subtle)
  const cinemaBase =
    "relative w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-200";

  return (
    <Portal>
      <div
        className={`fixed inset-0 flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-sm duration-500
        ${
          isOpen
            ? "opacity-100 z-[1000] transition-opacity"
            : "-z-50 opacity-0 transition-all"
        }`}
        onClick={checkOutsideAndCloseModal}
        onMouseDown={handleMouseDown}
      >
        <div
          ref={modalRef}
          className={`
            max-h-screen max-w-[100vw] overflow-auto
            ${cinemaBase}
            ${toAnimate ? "transition-all duration-500 ease-out" : ""}
            ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none select-none"}
            ${
              toAnimate &&
              (isOpen
                ? getEnterAnimation(animationEnter)
                : getExitAnimation(animationExit))
            }
            ${className}
          `}
        >
          {showCloseIcon && (
            <div className="flex justify-end px-4 pt-4">
              <button
                className="
                  flex h-8 w-8 items-center justify-center
                  rounded-full
                  bg-gray-100
                  text-gray-500
                  shadow-sm
                  hover:bg-gray-200 hover:text-gray-800
                  transition
                "
                onClick={onClose}
              >
                <IoCloseCircleOutline width={18} height={18} />
              </button>
            </div>
          )}
          <div className="px-5 pb-5 pt-1">{children}</div>
        </div>
      </div>
    </Portal>
  );
};

Portal.propTypes = {
  children: PropTypes.node.isRequired,
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isDismissible: PropTypes.bool,
  showCloseIcon: PropTypes.bool,
  toAnimate: PropTypes.bool,
  animationEnter: PropTypes.string,
  animationExit: PropTypes.string,
  className: PropTypes.string,
};

export default Modal;
