import { atom } from 'recoil';

export const chatSettingsState = atom({
  key: 'chatSettingsState',
  default: {
    recommendationsClicked: false,
  },
});
