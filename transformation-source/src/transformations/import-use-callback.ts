import { LogLevel } from '../enums/log-level.enum';
import { Log } from '../models/log.model';
import { logger } from '../utils/logger.util';

import { TransformationDetails } from '../models/transformation-details.model';
import * as T from '@babel/types';
import { NodePath } from '@babel/traverse';

export default function importUseCallback(td: TransformationDetails): void {

  const theNode: NodePath<T.Node> = td.astNodeAfter;

  if (!theNode.isProgram()) {
    logger.log(
      new Log.Builder()
        .withSeverity(LogLevel.LOG)
        .withModule('transformations.importUseCallback()')
        .withMessage('Expected program, got a ' + theNode.type)
        .build()
    );
    return;
  }

  const importDeclarations: T.ImportDeclaration[] = <T.ImportDeclaration[]>theNode.node.body
    .filter((node: any): boolean => T.isImportDeclaration(node));

  const importsUseCallback: any[] = importDeclarations
    .filter((node: T.ImportDeclaration): boolean => node.source.value === 'react'
  && (node.specifiers
    .filter((importNode: T.ImportDefaultSpecifier | T.ImportSpecifier): boolean => {
      if (T.isImportDefaultSpecifier(importNode) || T.isImportNamespaceSpecifier(importNode)) {
        return false;
      } else {
        return (<T.Identifier>(<T.ImportSpecifier>importNode).imported).name === 'useCallback';
      }
    }).length > 0));

  if (importsUseCallback.length === 0) {
    const importSpecifiers: T.ImportSpecifier[] = [T.importSpecifier(T.identifier('useCallback'), T.identifier('useCallback'))];
    const useCallbackImport: T.ImportDeclaration = T.importDeclaration(importSpecifiers, T.stringLiteral('react'));
    (<T.Program>theNode.node).body.unshift(useCallbackImport);
  }

}
