import React, { useState, useEffect }  from 'react';

import { Card, Container, Row, Col } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers';

// ABIs
import Marketplace from '../abis/Marketplace.json'
import RoyaltyNFT from '../abis/RoyaltyNFT.json'

// Config
import config from '../config.json';

const CardCollection = ({ items }) => {

    const [provider, setProvider] = useState(null)

    const [marketplace, setMarketPlace] = useState(null)

    const [nft, setNFT] = useState(null)

    const [message, setMessage] = useState("")

    const [isWaiting, setIsWaiting] = useState(false)

    const loadBlockchainData2 = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)
    
        const network = await provider.getNetwork()

        const nft = new ethers.Contract(config[network.chainId].nft.address, RoyaltyNFT, provider)
        setNFT(nft)

        const marketplace = new ethers.Contract(config[network.chainId].marketplace.address, Marketplace, provider)
        setMarketPlace(marketplace)

      }
    
  const handleListing = async (event, cost) =>{
    event.preventDefault()
    setIsWaiting(true)
    setMessage("Waiting for Approval by {nft.address}")

    const signer = await provider.getSigner()
    const approve = await nft.connect(signer).approve(marketplace.address, 1)
    await approve.wait()

    setMessage("Waiting to List at {marketplace.address}")


    const listTrans = await marketplace.connect(signer).list(1, parseFloat(cost))
    await listTrans.wait()
    // transaction = await marketplace.connect(minter).list(1, COST)
    // await transaction.wait()
    setIsWaiting(false)
    setMessage("")
  }
  useEffect(() => {
    loadBlockchainData2()
  }, [])

  return (
    <Container>
      <Row>
        {items?.map((item) => (
          <Col key={item.id} sm={6} md={4} lg={3}>
            <Card>
            <Card.Header>{item.title}</Card.Header>
               {!isWaiting && item.metadataURI ? (
                <Card.Img variant="top" src={item.metadataURI} />
                ) : isWaiting ? (
                    <div className="image__placeholder">
                    <Spinner animation="border" />
                    <p>{message}</p>
                    </div>
                ) : (
                    <></>
                )}
              <Card.Body>
                <Card.Text>{item.description}</Card.Text>
                <Button variant="primary" onClick={(event) => handleListing(event, item.cost)}>List</Button>
              </Card.Body>
              <ListGroup className="list-group-flush">
                <ListGroup.Item>Selling Price: {item.cost}  ETH</ListGroup.Item>
            </ListGroup>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CardCollection;
