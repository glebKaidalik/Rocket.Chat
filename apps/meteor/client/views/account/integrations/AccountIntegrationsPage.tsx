import type { IWebdavAccountIntegration } from '@rocket.chat/core-typings';
import { Box, Select, SelectOption, Field, Button } from '@rocket.chat/fuselage';
import { useToastMessageDispatch, useMethod, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useMemo, useCallback, ReactElement } from 'react';

import { WebdavAccounts } from '../../../../app/models/client';
import Page from '../../../components/Page';
import { useForm } from '../../../hooks/useForm';
import { useReactiveValue } from '../../../hooks/useReactiveValue';
import { getWebdavServerName } from '../../../lib/getWebdavServerName';

const getWebdavAccounts = (): IWebdavAccountIntegration[] => WebdavAccounts.find().fetch();

const AccountIntegrationsPage = (): ReactElement => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();
	const accounts = useReactiveValue(getWebdavAccounts);
	const removeWebdavAccount = useMethod('removeWebdavAccount');

	const {
		values: { selected },
		handlers: { handleSelected },
	} = useForm({ selected: [] });

	const options: SelectOption[] = useMemo(() => accounts?.map(({ _id, ...current }) => [_id, getWebdavServerName(current)]), [accounts]);

	const handleClickRemove = useCallback(() => {
		try {
			removeWebdavAccount(selected as string);
			dispatchToastMessage({ type: 'success', message: t('Webdav_account_removed') });
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: String(error) });
		}
	}, [dispatchToastMessage, removeWebdavAccount, selected, t]);

	return (
		<Page>
			<Page.Header title={t('Integrations')} />
			<Page.ScrollableContentWithShadow>
				<Box maxWidth='x600' w='full' alignSelf='center'>
					<Field>
						<Field.Label>{t('WebDAV_Accounts')}</Field.Label>
						<Field.Row>
							<Select options={options} onChange={handleSelected} value={selected as string} placeholder={t('Select_an_option')} />
							<Button danger onClick={handleClickRemove}>
								{t('Remove')}
							</Button>
						</Field.Row>
					</Field>
				</Box>
			</Page.ScrollableContentWithShadow>
		</Page>
	);
};

export default AccountIntegrationsPage;
