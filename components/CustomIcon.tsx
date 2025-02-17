import { SvgProps } from 'react-native-svg';
import ShirtIcon from '../assets/images/shirt_icon_198805.svg';
import PantsIcon from '../assets/images/pants22.svg';
import DressIcon from '../assets/images/dress22.svg';
import JacketIcon from '../assets/images/jacket22.svg';

type IconName = 't-shirt' | 'pants' | 'dress' | 'jacket';

interface CustomIconProps extends SvgProps {
  name: IconName;
}

export function CustomIcon({ name, width = 48, height = 48, ...props }: CustomIconProps) {
  const iconProps = {
    width,
    height,
    preserveAspectRatio: "xMidYMid meet",
    fill: "#704f38",
    ...props
  };

  switch (name) {
    case 't-shirt':
      return <ShirtIcon {...iconProps} viewBox="0 0 640 512" />;
    case 'pants':
      return <PantsIcon {...iconProps} viewBox="-236 28 256 256" />;
    case 'dress':
      return <DressIcon {...iconProps} viewBox="0 0 512 412" />;
    case 'jacket':
      return <JacketIcon {...iconProps} viewBox="0 0 328 328" />;
    default:
      return <PantsIcon {...iconProps} viewBox="-236 28 256 256" />;
  }
}
