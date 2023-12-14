import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function ChevronIcon(props: any) {
  return (
    <Svg
      width="48px"
      height="48px"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M328 112L184 256 328 400"
        fill="none"
        stroke={'white'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="48px"
      />
    </Svg>
  );
}

export default ChevronIcon;
