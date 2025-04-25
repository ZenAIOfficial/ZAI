import { useDialog } from "@/hooks/useDialog";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DelectDialog = (props: any) => {
  const { hideDialog } = useDialog();
  const setVisible = async () => {
      props.onConfirm();
  }

  return (
      <div>
          <div className="flex flex-col w-full md:w-[500px] items-center mt-6 relative px-8 pb-6 bg-background rounded-[24px] pt-6">
              <span className="text-primary2 text-xl mb-4 self-start font-bold">Are you absolutely sure?</span>
              <div
                  className="flex items-center w-full"
                  onClick={() => {}}>
                  <span className="text-primary2 text-[#666666] font-400">This action cannot be undone. This will permanently delete your chat and remove it from our servers.</span>
              </div>
              <div className="flex flex-row w-full justify-end items-end mt-5">
                  <div className="px-5 py-2.5 border border-[#E4E4E7] rounded-xl hover:bg-[#E4E4E780]" onClick={hideDialog}>Cancel</div>
                  <div className="px-5 py-2.5 transfer_bg text-white rounded-xl ml-4 hover:bg-[#EA2EFE80]" onClick={setVisible}>Continue</div>
              </div>
          </div>
      </div>
  );
};

export default DelectDialog;