import { Button, Dialog } from '@radix-ui/themes';
import { X } from 'lucide-react';

type AboutStudentPortalModalProps = {
  onClose: () => void;
};

export function AboutStudentPortalModal({ onClose }: AboutStudentPortalModalProps) {
  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content className="max-w-[640px] overflow-hidden p-0">
        <div className="flex items-center justify-between gap-5 border-b border-slate-200 px-[22px] py-[18px]">
          <Dialog.Title className="m-0 text-[clamp(22px,2.4vw,28px)] leading-tight text-slate-900">
            About the Student and Alumni Portal
          </Dialog.Title>
          <Dialog.Close>
            <button
              className="grid size-11 flex-none cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-slate-500 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
              type="button"
              aria-label="Close"
            >
              <X aria-hidden="true" size={28} />
            </button>
          </Dialog.Close>
        </div>

        <div className="overflow-auto px-6 py-5.5 text-lg leading-relaxed text-slate-800 max-sm:text-[19px]">
          <p>The Student and Alumni Portal allows current and former ITAC students to:</p>
          <ul className="my-6 list-disc pl-6">
            <li>Update their contact and related information</li>
            <li>Connect with other ITAC students and alumni within the same center</li>
            <li>View past activity and associated metrics</li>
            <li>Request ITAC student certificates</li>
            <li>Find potential job opportunities</li>
            <li>Complete the Entry Survey and Exit Survey</li>
          </ul>
          <p>
            <strong>ACTIVE ITAC STUDENTS:</strong> To register for this portal, your email address must first match an
            existing ITAC student email. Please contact your center to create/update the information if needed.
          </p>
          <p>
            <strong>ALUMNI:</strong> If you are no longer able to access the email address for your account, please contact
            your center to update your contact information.
          </p>
          <div className="rounded-lg border border-slate-300 bg-slate-300/75 px-4.5 py-4 text-slate-600">
            All current and former ITAC students will be given access.
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-slate-200 px-[22px] py-4">
          <Dialog.Close>
            <Button color="gray" highContrast>
              Close
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
