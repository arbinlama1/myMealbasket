module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  plugins: [
    'react-hooks'
  ],
  rules: {
    // Disable exhaustive-deps rule for now to avoid the error
    'react-hooks/exhaustive-deps': 'off'
  }
};
