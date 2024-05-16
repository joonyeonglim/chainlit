import { atom } from 'recoil';

// 새로운 상태 관리를 위한 Recoil 상태
export const chatSettingsState = atom({
  key: 'chatSettingsState',
  default: {
    recommendationsClicked: false,
    recommendations: [],
    showButtons: false,
  },
});
