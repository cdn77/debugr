import type { TContextBase, TContextShape } from '@debugr/core';
import { formatData, isEmpty } from '@debugr/core';
import type { GraphQLQueryLogEntry } from '@debugr/graphql-common';
import { getGraphQLOperation } from '@debugr/graphql-common';
import { escapeHtml, renderCode, renderDetails } from '../templates';
import { AbstractHtmlFormatter } from './abstract';

export class GraphQLQueryHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractHtmlFormatter<TTaskContext, TGlobalContext> {
  readonly id: string = 'debugr-graphql-query-html-formatter';

  readonly entryType: string = 'graphql.query';

  getEntryLabel(): string {
    return 'GraphQL query';
  }

  getEntryTitle(entry: GraphQLQueryLogEntry<TTaskContext, TGlobalContext>): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the GraphQLFormatter plugin');
    }

    return getGraphQLOperation(entry.data) ?? 'Unknown GraphQL operation';
  }

  renderEntry(entry: GraphQLQueryLogEntry<TTaskContext, TGlobalContext>): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the GraphQLFormatter plugin');
    }

    return this.renderParts(
      entry.data.operation &&
        `<p>
            <strong>Operation:</strong>
            <span class="mono">${escapeHtml(entry.data.operation)}</span>
          </p>`,
      renderDetails('Query:', renderCode(entry.data.query, 'graphql')),
      !isEmpty(entry.data.variables) &&
        renderDetails('Variables:', renderCode(formatData(entry.data.variables))),
      entry.error && this.renderError(entry.error),
    );
  }
}
