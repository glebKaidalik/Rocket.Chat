import { Box, IconButton } from '@rocket.chat/fuselage';
import { useLayout, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useContext, FC, ComponentProps, ReactNode } from 'react';

import BurgerMenu from '../BurgerMenu';
import TemplateHeader from '../Header';
import PageContext from './PageContext';

type PageHeaderProps = {
	title: ReactNode;
	onClickBack?: () => void;
	borderBlockEndColor?: string;
} & Omit<ComponentProps<typeof Box>, 'title'>;

const PageHeader: FC<PageHeaderProps> = ({ children = undefined, title, onClickBack, borderBlockEndColor, ...props }) => {
	const t = useTranslation();
	const [border] = useContext(PageContext);
	const { isMobile } = useLayout();

	return (
		<Box borderBlockEndWidth='x2' borderBlockEndColor={borderBlockEndColor ?? border ? 'neutral-200' : 'transparent'} {...props}>
			<Box
				marginBlock='x16'
				marginInline='x24'
				minHeight='x40'
				display='flex'
				flexDirection='row'
				flexWrap='nowrap'
				alignItems='center'
				color='neutral-800'
				{...props}
			>
				{isMobile && (
					<TemplateHeader.ToolBox>
						<BurgerMenu />
					</TemplateHeader.ToolBox>
				)}
				{onClickBack && <IconButton small mie='x8' icon='arrow-back' onClick={onClickBack} title={t('Back')} />}
				<Box is='h2' fontScale='h2' flexGrow={1}>
					{title}
				</Box>
				{children}
			</Box>
		</Box>
	);
};

export default PageHeader;
