// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./VerifySignature.sol";

contract NFT is ERC721, VerifySignature {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(address => uint256[]) ownerToDocumentsMapping;
    mapping(uint256 => NFTInfo) public nftMetadataMapping;

    // is address allowed to sign document
    mapping(uint256 => mapping(address => bool)) addressToDocumentToAllowedMapping;

    // allow signers to read the document
    // temporarly stores document encrypted with signer encryptionKey
    mapping(address => mapping(uint256 => string))
        public signerToDocumentVerifyMapping;

    // store positions of signature of signers
    mapping(address => mapping(uint256 => uint256)) addressToDocumentIdToSignaturePosition;

    // flag if already signed
    mapping(address => mapping(uint256 => bool)) public signerToDocumentSigned;

    //====================== EVENTS ========================================

    event DocumentCreation(uint256 documentId, address creator);
    event AddSigner(uint256 documentId, address signer);
    event DocumentSigned(uint256 documentId, address signer);

    //=================================================================

    struct NFTInfo {
        string encryptedFile;
        bytes[] signatures;
        uint256 previousNFTId; // store previous version of document (tokenID)
    }

    constructor() ERC721("JusticeNFT", "JustNFT") {}

    function tokenMetadata(uint256 tokenId)
        public
        view
        returns (NFTInfo memory)
    {
        return nftMetadataMapping[tokenId];
    }

    function getUserDocuments() public view returns (uint256[] memory) {
        return ownerToDocumentsMapping[msg.sender];
    }

    function mint(string memory encryptedFile, uint256 previousNFTId)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);

        bytes[] memory _signatures;

        nftMetadataMapping[newItemId] = NFTInfo({
            encryptedFile: encryptedFile,
            signatures: _signatures,
            previousNFTId: previousNFTId
        });
        emit DocumentCreation(newItemId, msg.sender);

        ownerToDocumentsMapping[msg.sender].push(newItemId);

        return newItemId;
    }

    function addSigner(
        uint256 documentId,
        address signer,
        string memory encryptedDocument
    ) external returns (bool) {
        require(
            ownerOf(documentId) == msg.sender,
            "Only owner of document can add signers"
        );

        addressToDocumentToAllowedMapping[documentId][signer] = true;
        signerToDocumentSigned[signer][documentId] = false;
        signerToDocumentVerifyMapping[signer][documentId] = encryptedDocument;

        emit AddSigner(documentId, signer);

        return true;
    }

    function signDocument(uint256 documentId, bytes calldata _sig)
        external
        returns (bool)
    {
        require(
            addressToDocumentToAllowedMapping[documentId][msg.sender],
            "Not allowed to sign document"
        );
        require(
            !signerToDocumentSigned[msg.sender][documentId],
            "Already signed"
        );
        require(verify(msg.sender, documentId, _sig), "Invalid signer");

        nftMetadataMapping[documentId].signatures.push(_sig);
        addressToDocumentIdToSignaturePosition[msg.sender][documentId] =
            nftMetadataMapping[documentId].signatures.length -
            1;

        signerToDocumentSigned[msg.sender][documentId] = true;
        signerToDocumentVerifyMapping[msg.sender][documentId] = "0x0";

        emit DocumentSigned(documentId, msg.sender);

        return true;
    }

    function verifySigningOfDocument(uint256 documentId, address signer)
        public
        view
        returns (bool)
    {
        bytes memory signature = nftMetadataMapping[documentId].signatures[
            addressToDocumentIdToSignaturePosition[signer][documentId]
        ];
        return verify(signer, documentId, signature);
    }
}
