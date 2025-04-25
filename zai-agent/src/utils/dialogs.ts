let _dialogVisible = false;

export const showDialogCallback = () => {
  _dialogVisible = true;
};

export const hideDialogCallback = () => {
  _dialogVisible = false;
};

export const getVisible = () => {
  return _dialogVisible
};