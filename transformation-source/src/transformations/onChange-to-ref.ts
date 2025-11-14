import { LogLevel } from '../enums/log-level.enum';
import { Log } from '../models/log.model';
import { logger } from '../utils/logger.util';

import { TransformationDetails } from '../models/transformation-details.model';
import * as T from '@babel/types';
import { NodePath } from '@babel/traverse';

export default function onChangeToRef(td: TransformationDetails): void {

  const theNode: NodePath<T.Node> = td.astNodeAfter;

  if (!theNode.isJSXAttribute()) {
    logger.log(
      new Log.Builder()
        .withSeverity(LogLevel.LOG)
        .withModule('transformations.onchangeToRef()')
        .withMessage('Expected program, got a ' + theNode.type)
        .build()
    );
    return;
  }

  theNode.node.name = T.jSXIdentifier('ref');
  theNode.node.value = T.jsxExpressionContainer(T.identifier(td.additionalInfo.varName));

  let valueIndex: number = -1;
  ((<T.JSXOpeningElement>theNode.parentPath.node).attributes as unknown as T.JSXAttribute[])
    .forEach((attr: T.JSXAttribute, index: number): void => {
      if (attr.name.name === 'value') {
        valueIndex = index;
      }
    });

  if (valueIndex > -1) {
    ((<T.JSXOpeningElement>theNode.parentPath.node).attributes as unknown as T.JSXAttribute[]).splice(valueIndex, 1);
  }

}
