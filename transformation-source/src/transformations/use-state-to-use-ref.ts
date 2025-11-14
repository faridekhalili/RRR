import { LogLevel } from '../enums/log-level.enum';
import { Log } from '../models/log.model';
import { logger } from '../utils/logger.util';

import { TransformationDetails } from '../models/transformation-details.model';
import * as T from '@babel/types';
import { NodePath } from '@babel/traverse';

export default function useStateToUseRef(td: TransformationDetails): void {

  const theNode: NodePath<T.Node> = td.astNodeAfter;

  if (!(theNode.isVariableDeclarator() || theNode.isVariableDeclaration())) {
    logger.log(
      new Log.Builder()
        .withSeverity(LogLevel.LOG)
        .withModule('transformations.useStateToUseRef()')
        .withMessage('Expected variable declarator, got a ' + theNode.type)
        .build()
    );
    return;
  }

  if (theNode.isVariableDeclarator()) {

    const variableName: string = (<T.Identifier>(<T.ArrayPattern>(<T.VariableDeclarator>theNode.node).id).elements[0]).name;

    (<T.VariableDeclarator>theNode.node).id = T.identifier(variableName);
    (<T.Identifier>(<T.CallExpression>(<T.VariableDeclarator>theNode.node).init).callee).name = 'useRef';
    (<T.Identifier>(<T.CallExpression>(<T.VariableDeclarator>theNode.node).init).callee).loc.identifierName = 'useRef';

  } else {

    const variableName: string = (<T.Identifier>(<T.ArrayPattern>(<T.VariableDeclarator>theNode.node.declarations[0]).id).elements[0]).name;

    (<T.VariableDeclarator>theNode.node.declarations[0]).id = T.identifier(variableName);
    (<T.Identifier>(<T.CallExpression>(<T.VariableDeclarator>theNode.node.declarations[0]).init).callee).name = 'useRef';
    (<T.Identifier>(<T.CallExpression>(<T.VariableDeclarator>theNode.node.declarations[0]).init).callee).loc.identifierName = 'useRef';

  }


}
