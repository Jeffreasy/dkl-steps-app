import { render } from '@testing-library/react-native';
import DashboardScreen from '../DashboardScreen';

// Simple smoke test - just verify it renders without crashing
describe('DashboardScreen', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<DashboardScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });
});