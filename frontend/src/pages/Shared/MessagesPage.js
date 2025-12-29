import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import UnderDevelopmentNotice from '../../components/common/UnderDevelopmentNotice';

const MessagesPage = () => {
  const { setPageTitle } = useOutletContext();
  const { t } = useTranslation();

  useEffect(() => {
    setPageTitle(t('sidebar.messages'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPageTitle, t]);

  return (
    <div className="min-h-[60vh] flex items-center">
      <UnderDevelopmentNotice />
    </div>
  );
};

export default MessagesPage;
