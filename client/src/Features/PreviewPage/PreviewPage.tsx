import React from 'react';
import { SimpleComponentStyles } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled } from '@fluentui/react';
import { PageWrapper } from '../../Core/Components/Common/PageWrapper';
import { StudentViewContent } from '../StudentView/StudentViewContent';

type PreviewPageStyles = SimpleComponentStyles<'root'>;

const PreviewPageInner = (): JSX.Element => {
  return (
    <PageWrapper title="Preview">
      <StudentViewContent />
    </PageWrapper>
  );
};

const previewPageStyles = (): PreviewPageStyles => ({
  root: [{}]
});

export const PreviewPage = styled(PreviewPageInner, previewPageStyles);
