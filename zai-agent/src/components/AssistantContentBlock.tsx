/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { log } from '@/utils/utils';
import AssistantBalanceCheckBlock from './Block/AssistantBalanceCheckBlock';
import AssistantBuyBlock from './Block/AssistantBuyBlock';
import AssistantTextBlock from './Block/AssistantTextBlock';
import AssistantTokenInfoBlock from './Block/AssistantTokenInfoBlock';
import AssistantThinkBlock from './Block/AssistantThinkBlock';
import AssistantSellBlock from './Block/AssistantSellBlock';
import AssistantTokenDetailBlock from './Block/AssistantTokenDetailBlock';
import AssistantTopUpAccount from './Block/AssistantTopUpAccount';
import AssistantTiktokUser from './Block/AssistantTiktokUser';
import AssistantLink from './Block/AssistantLink';
import AssistantTokenDetailHtmlBlock from './Block/AssistantTokenDetailHtmlBlock';
import AssistantTransferBlock from './Block/AssistantTransferBlock';
import AssistantShareTokenInfoBlock from './Block/AssistantShareTokenInfoBlock';
import AssistantTokenOHLCBlock from './Block/AssistantTokenOHLCBlock';

interface AssistantContentBlockProps {
  text: string;
  onTyping?: () => void;
  handleManualResponse: (qId: string, content: any[]) => void;
}

const AssistantContentBlock: React.FC<AssistantContentBlockProps> = ({text, handleManualResponse}) => {
  // const preformattedTextStyles: React.CSSProperties = {
  //   whiteSpace: 'pre-wrap',
  //   wordBreak: 'break-word',
  // };

  const processText = (inputText: string): React.ReactNode[] => {
    const sections: React.ReactNode[] = [];
    const chat = JSON.parse(inputText);
    // console.log("AssistantContentBlock", chat);
    let index = 1;
    chat.map((item: any) => {
      index++;
      if (item.action === "text") {
        if (item.text === "Thinking...") {
          sections.push(<AssistantThinkBlock key={`block-id-${index}`} />);
        } else {
//           item.text = `A paragraph with *emphasis* and **strong importance**.

// > A block quote with ~strikethrough~ and a URL: https://reactjs.org.


// * Lists
// * [ ] todo
// * [x] done

// A table:

// | a | b |
// | - | - |

// aaaa\`a\`a

// \`\`\`js
// console.log('It works!')
// \`\`\`
// `;
// item.text=`The transaction was successful! You sent 0.001 SOL to \`@freelifer10\`. Here's a share link for the recipient to claim their tokens:[Claim Tokens](http://localhost:5173/transfer/1894630390959570944).`;
          sections.push(<AssistantTextBlock key={`block-id-${index}`} text={item.text} loading={false} role='' />);
          // sections.push(<AssistantLink key={`block-id-${index}`} />);
        }
      } else if(item.action === "tokenInfo") {
        const token = {
          name: item.symbol,
          img: item.imageUrl,
          des: item.name,
          text: item.text,
          network: item.network,
        }
        sections.push(<AssistantTokenInfoBlock key={`block-id-${index}`} token={token} />);
      } else if (item.action === "buyToken") {
        const token = {
          oneQuestId: item.oneQuestId,
          name: item.symbol,
          img: item.imageUrl,
          des: item.name,
          text: item.text,
          needSol: item.needSol,
          transferStatus: item.transferStatus,
          code: item.code,
          needAmount: item.needAmount,
          network: item.network,
        }
        sections.push(<AssistantBuyBlock key={`block-id-${index}`} token={token} />);
      } else if (item.action === "sellToken") {
        const token = {
          oneQuestId: item.oneQuestId,
          name: item.symbol,
          img: item.imageUrl,
          des: item.name,
          text: item.text,
          tokenAmount: item.tokenAmount,
          transferStatus: item.transferStatus,
          code: item.code,
        }
        sections.push(<AssistantSellBlock key={`block-id-${index}`} token={token} />);
      } else if (item.action === "balanceCheck") {
        const token = {
          symbol: item.symbol,
          userBalanceCoin: item.userBalanceCoin,
          needCoin: item.needCoin,
          network: item.network,
        }

        sections.push(<AssistantBalanceCheckBlock key={`block-id-${index}`} data={token}/>);
      } else if (item.action === "tokenDetail") {
        const token = {
          name: item.symbol,
          img: item.imageUrl,
          des: item.name,
          text: item.text,
          list: item.list,
          infoDetail: item.infoDetail,
        }
        sections.push(<AssistantTokenDetailBlock key={`block-id-${index}`} token={token} />);
      } else if (item.action === "transferConfirmation") {
        const token = {
          oneQuestId: item.oneQuestId,
          name: item.symbol,
          img: item.imageUrl,
          des: item.name,
          text: item.text,
          needAmount: item.needAmount,
          symbol: item.symbol,
          tokenAmount: item.tokenAmount,
          targetAccount: item.targetAccount,
          transferStatus: item.transferStatus,
          code: item.code,
        }
        sections.push(<AssistantTransferBlock key={`block-id-${index}`} token={token} handleManualResponse={handleManualResponse} />);
      } else if (item.action === "topUp") {
        sections.push(<AssistantTopUpAccount key={`block-id-${index}`} />);
      } else if (item.action === "tiktokInfo") {
        const token = {
          oneQuestId: item.oneQuestId,
          username: item.username,
          name: item.name,
          img: item.imageUrl,
          desc: item.bioDescription,
          followerCount: item.followerCount,
          followingCount: item.followingCount,
          likesCount: item.likesCount,
        }
        sections.push(<AssistantTiktokUser key={`block-id-${index}`} token={token} />);
      } else if (item.action === "shareLinkCreated") {
        const token = {
          oneQuestId: item.oneQuestId,
          text: item.text,
        }
        sections.push(<AssistantLink key={`block-id-${index}`} token={token} />);
      } else if (item.action === "tokenDetailHtml") {
        const token = {
          name: item.symbol,
          img: item.imageUrl,
          des: item.name,
          text: item.text,
          list: item.list,
          infoDetail: item.infoDetail,
        }
        sections.push(<AssistantTokenDetailHtmlBlock key={`block-id-${index}`} token={token} />);
      } else if (item.action === "ohlc") {
        const token = {
          name: item.symbol,
          img: item.imageUrl,
          des: item.name,
          priceStr: item.priceStr,
          network: item.network,
          list: item.list,
        }
        sections.push(<AssistantTokenOHLCBlock key={`block-id-${index}`} token={token} />);
      } else if (item.action === "analyzeShare") {
        const token = {
          img: item.image,
          text: item.text,
          chineseText: item.chineseText,
          shareFindWhalesUrl: item.shareFindWhalesUrl,
        }
        sections.push(<AssistantShareTokenInfoBlock key={`block-id-${index}`} token={token} />);
      }
    })
    
    // inputText.split(SNIPPET_MARKERS.begin).forEach((section, index) => {
    //   if (index === 0 && !section.includes(SNIPPET_MARKERS.end)) {
        
    //     return;
    //   }

    //   const endSnippetIndex = section.indexOf(SNIPPET_MARKERS.end);
    //   if (endSnippetIndex !== -1) {
    //     const snippet = section.substring(0, endSnippetIndex);
    //     sections.push(
    //         <FoldableTextSection key={`foldable-${index}`} content={snippet}/>
    //     );

    //     const remainingText = section.substring(endSnippetIndex + SNIPPET_MARKERS.end.length);
    //     if (remainingText) {
    //       sections.push(<div key={`text-after-${index}`}
    //                          style={preformattedTextStyles}>{remainingText}</div>);
    //     }
    //   } else {
    //     sections.push(<div key={`text-start-${index}`} style={preformattedTextStyles}>{section}</div>);
    //   }
    // });
    return sections;
  };

  const content = processText(text);

  log(text);
  return (
    <div className="w-full grid grid-cols-1 gap-4 pb-3">
      {
        content
      }
    </div>
  );
};

export default AssistantContentBlock;
