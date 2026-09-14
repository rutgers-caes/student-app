import { MouseEvent, useEffect, useState } from 'react';
import { AlertDialog, Button } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';

type UnsavedChangesGuardOptions = {
  when: boolean;
  message?: string;
};

const defaultMessage = 'All changes will not be saved.';

export function useUnsavedChangesGuard({
  when,
  message = defaultMessage,
}: UnsavedChangesGuardOptions) {
  const navigate = useNavigate();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!when) return undefined;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [message, when]);

  useEffect(() => {
    if (!when) return undefined;

    const handleDocumentClick = (event: globalThis.MouseEvent) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.altKey
        || event.ctrlKey
        || event.shiftKey
      ) {
        return;
      }

      const target = event.target instanceof Element
        ? event.target.closest('a[href]')
        : null;
      if (!(target instanceof HTMLAnchorElement)) return;
      if (target.target && target.target !== '_self') return;

      const nextUrl = new URL(target.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      if (nextUrl.href === currentUrl.href) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingHref(nextUrl.href);
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [when]);

  function stayOnPage(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    setPendingHref(null);
  }

  function leavePage(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    if (!pendingHref) return;

    const nextUrl = new URL(pendingHref);
    const currentUrl = new URL(window.location.href);
    setPendingHref(null);

    if (nextUrl.origin === currentUrl.origin) {
      navigate(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
      return;
    }

    window.location.assign(pendingHref);
  }

  return (
    <AlertDialog.Root open={Boolean(pendingHref)} onOpenChange={(open) => !open && stayOnPage()}>
      <AlertDialog.Content maxWidth="420px">
        <AlertDialog.Title>Leave without saving?</AlertDialog.Title>
        <AlertDialog.Description size="2">
          {message}
        </AlertDialog.Description>
        <div className="mt-5 flex justify-end gap-3">
          <AlertDialog.Cancel>
            <Button color="gray" variant="soft" onClick={stayOnPage}>
              Stay
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button color="red" onClick={leavePage}>
              Leave
            </Button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
