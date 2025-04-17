"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);
  const nodeRef = useRef(null);    // ← ref for CSSTransition

  useEffect(() => {
    setKey(pathname);
  }, [pathname]);

  return (
    <SwitchTransition mode="out-in">
      <CSSTransition
        key={key}
        nodeRef={nodeRef}          // ← pass ref here
        timeout={300}
        classNames="fade"
        unmountOnExit
      >
        <div ref={nodeRef} className="page-transition">
          {children}
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
}