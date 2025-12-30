import React, { useId } from 'react'
import styled from 'styled-components'

const AnimatedHamburger = ({ checked, onChange, label = 'Toggle menu', className }) => {
  const controlId = useId()

  return (
    <StyledWrapper className={className}>
      <div className="menuToggle">
        <input id={controlId} type="checkbox" checked={checked} onChange={onChange} />
        <label className="toggle" htmlFor={controlId} aria-label={label}>
          <div className="bar bar--top" />
          <div className="bar bar--middle" />
          <div className="bar bar--bottom" />
        </label>
      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  .menuToggle {
    display: inline-block;
  }

  input {
    display: none;
  }

  .toggle {
    position: relative;
    width: 20px;
    cursor: pointer;
    margin: auto;
    display: block;
    height: calc(2px * 3 + 7px * 2);
  }

  .bar {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    border-radius: calc(2px / 2);
    background: #1d4ed8;
    color: inherit;
    opacity: 1;
    transition: none 0.35s cubic-bezier(.5,-0.35,.35,1.5) 0s;
  }

  body[data-theme='dark'] & .bar {
    background: #f6c344;
  }

  /* Collapse Animation */

  .bar--top {
    bottom: calc(50% + 7px + 2px/ 2);
    transition-property: bottom,margin,transform;
    transition-delay: calc(0s + 0.35s),0s,0s;
  }

  .bar--middle {
    top: calc(50% - 2px/ 2);
    transition-property: top,opacity;
    transition-duration: 0.35s,0s;
    transition-delay: calc(0s + 0.35s * 1.3),calc(0s + 0.35s * 1.3);
  }

  .bar--bottom {
    top: calc(50% + 7px + 2px/ 2);
    transition-property: top,transform;
    transition-delay: 0s;
  }

  input:checked + .toggle .bar--top {
    bottom: calc(50% - 7px - 2px);
    margin-bottom: calc(7px + 2px/ 2);
    transform: rotate(45deg);
    transition-delay: calc(0s + 0.35s * .3),calc(0s + 0.35s * 1.3),calc(0s + 0.35s * 1.3);
  }

  input:checked + .toggle .bar--middle {
    top: calc(50% + 7px);
    opacity: 0;
    transition-duration: 0.35s,0s;
    transition-delay: 0s,calc(0s + 0.35s);
  }

  input:checked + .toggle .bar--bottom {
    top: calc(50% - 2px/ 2);
    transform: rotate(-45deg);
    transition-delay: calc(0s + 0.35s * 1.3),calc(0s + 0.35s * 1.3);
  }
`

export default AnimatedHamburger
