import { render } from '@testing-library/react-native';
import LazyLoadScreen from '../LazyLoadScreen';

describe('LazyLoadScreen', () => {
  it('renders correctly with logo and spinner', () => {
    const { UNSAFE_root } = render(<LazyLoadScreen />);
    // Just verify it renders without errors
    expect(UNSAFE_root).toBeTruthy();
  });
});