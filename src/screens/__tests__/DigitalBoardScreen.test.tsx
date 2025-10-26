import { render } from '@testing-library/react-native';
import DigitalBoardScreen from '../DigitalBoardScreen';

// Simple smoke test
describe('DigitalBoardScreen', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<DigitalBoardScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });
});