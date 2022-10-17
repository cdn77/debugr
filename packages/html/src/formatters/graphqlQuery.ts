import type { TContextBase, TContextShape } from '@debugr/core';
import { EntryType, formatData, isEmpty } from '@debugr/core';
import type { GraphqlQueryLogEntry } from '@debugr/graphql-common';
import { getGraphqlOperation } from '@debugr/graphql-common';
import { escapeHtml, renderCode, renderDetails } from '../templates';
import { AbstractHtmlFormatter } from './abstract';

export class GraphqlQueryHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractHtmlFormatter<TTaskContext, TGlobalContext> {
  public readonly id = 'debugr-graphql-query-html-formatter';
  public readonly entryType = EntryType.GraphqlQuery;

  public getEntryLabel(): string {
    return 'GraphQL query';
  }

  public getEntryTitle(entry: GraphqlQueryLogEntry<TTaskContext, TGlobalContext>): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the GraphQLFormatter plugin');
    }

    return getGraphqlOperation(entry.data) ?? 'Unknown GraphQL operation';
  }

  public renderEntry(entry: GraphqlQueryLogEntry<TTaskContext, TGlobalContext>): string {
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
